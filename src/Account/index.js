const shajs = require('sha.js');
const uuid = require('uuid/v4');

const Log = require('../Log');
const Result = require('../APICallResult'); 
const Database = require('../Database');

function hash(toHash) {
	return shajs('sha512').update(toHash).digest('hex');
}

// 7 days
const TOKEN_EXPARATION_TIME = 1000 * 60 * 60 * 24 * 7;

const VALIDATION_KEYS = {
	invalidUsername: 'INVALID_USERNAME',
	invalidPassword: 'INVALID_PASSWORD',
	invalidToken: 'INVALID_TOKEN',
	usernameAlreadyExists: 'USERNAME_ALREADY_EXISTS',
	badUsernamePasswordLogin: 'BAD_USERNAME_PASSWORD_LOGIN',
	internalServerError: 'INTERNAL_SERVER_ERROR',
}

const ERROR_MESSAGES = {
	[VALIDATION_KEYS.invalidUsername]: "The username you have entered is invalid.  Please make sure it is between 3 and 256 characters and it only contains letters, numbers, and the characters ',', '@', '.'.",
	[VALIDATION_KEYS.invalidPassword]: "The password you have entered is invalid.  Your password may be between 3 and 256 characters long and only contain letters, numbers, spaces, and the symbols '!', '\"', '#', '$', '%', '&', ''', '(', ')', '*', '+', ',', '\\', '/', ':', ';', '<', '=', '>', '@', '[', ']', '^', '_', '`', '{', '|', '}', '~'.",
	[VALIDATION_KEYS.invalidToken]: 'The token has expired.  Please login with your username.',
	[VALIDATION_KEYS.usernameAlreadyExists]: 'The username you have entered already exists.  Please try a different username.',
	[VALIDATION_KEYS.badUsernamePasswordLogin]: 'The username and password combination is incorrect.',
	[VALIDATION_KEYS.internalServerError]: 'There was an internal server error.  Please try again.',
}

function createErrorWithKey(key) {
	return Result.createError(ERROR_MESSAGES[key]);
}

function sanitizeUsername(username = '') {
	return username.replace(/[.]/g, ',');
}

function isValidUsername(username) {
	return !!username.match(/^[A-Za-z0-9,@]{3,256}$/g);
}

function isValidPassword(password) {
	return !!password.match(/^[A-Za-z0-9 !"#$%&'()*+,\-.\/:;<=>?@[\]^_`{|}~]{3,256}$/g);
}

function isValidToken(token) {
	return !!token.match(/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/g);
}

// [{ value: <input>, func: <validation function> }...]
// Returns false if all valid
// Otherwise returns key of the failing input
function validateInputs(...callsArray) {
	const res = callsArray.find((({value, func, key}) => !func(value)));
	if(res === undefined) {
		return false;
	}
	return createErrorWithKey(res.key);
}

function defaultValidationStruct(username, password) {
	return [
		{
			value: username,
			func: isValidUsername,
			key: VALIDATION_KEYS.invalidUsername
		},
		{
			value: password,
			func: isValidPassword,
			key: VALIDATION_KEYS.invalidPassword,
		}
	];
}

function defaultValidation(username, password) {
	return validateInputs(...defaultValidationStruct(username, password));
}

// Expects username to be valid and sanitized
async function getUser(username, extraPath = "") {
	return await Database.read(`user/${username}/${extraPath}`);;
}

async function doesUserExist(username) {
	return !!(await getUser(username));
}

function writeUser(username, pathToData = "", data) {
	Database.write(`user/${username}/${pathToData}`, data);
}

async function writeUserTransaction(username, pathToData = "", callback, onComplete) {
	return await Database.writeTransaction(
		`user/${username}/${pathToData}`,
		callback,
		onComplete
	);
}

function createSalt() {
	return uuid();
}

function hashPassword(password, salt) {
	return hash(salt + password);
}

function createValidationToken() {
	return uuid();
}

async function createAndAddLoginToken(username) {
	const loginToken = createValidationToken();
	const res = await writeUserTransaction(
		sanitizedUsername, 
		"/account/tokens", 
		(tokens) => {
			const now = new Date();
			const token = {
				token: loginToken,
				date: now.getTime(),
			}
			const result = tokens && tokens.concat(token) || [token];
			return result.reduce((acc, token) => {
				const { date } = token;
				if(date + TOKEN_EXPARATION_TIME < now) {
					return acc;
				}
				return acc.concat(token);
			}, [])
		})
		.then(({ committed = false }) => {
			return committed;
		}).catch(error => {
			Log.log('Account', 'createAndAddLoginToken', 'error adding token: ', error);
			return false;
		});
	if(!res) {
		return createErrorWithKey(VALIDATION_KEYS.internalServerError);
	}
	return Result.create(loginToken);
}

async function validateLoginToken(username, token) {
	// Validate input
	sanitizedUsername = sanitizeUsername(username);
	const error = validateInputs(
		{ 
			value: username, 
			func: isValidUsername, 
			key: VALIDATION_KEYS.invalidUsername
		}, 
		{
			value: token, 
			func: isValidToken, 
			key: VALIDATION_KEYS.invalidToken
		});
	if(error) {
		return error;
	}

	const tokens = await getUser(username, '/account/tokens');
	return !!tokens.find(({t}) => token === t);
}

async function create(username, password) {
	// Validate input
	sanitizedUsername = sanitizeUsername(username);
	const error = defaultValidation(sanitizedUsername, password);
	if(error) {
		return error;
	}
	
	Log.log('Account', 'create', 'Attempt to create with: ', { username, sanitizedUsername});
	
	// ensure account doesn't already exist
	if(await doesUserExist(sanitizedUsername)) {
		// user data already found
		Log.log('Account', 'create', 'Account already exists for: ', { username, sanitizedUsername });
		return createErrorWithKey(VALIDATION_KEYS.usernameAlreadyExists);
	}

	// Good to create user
	const salt = createSalt();
	const hashedPassword = hashPassword(password, salt);
	Log.log('Account', 'create', 'Created account: ', { username, sanitizedUsername });
	writeUser(sanitizedUsername, 'account', {
		username,
		sanitizedUsername,
		salt,
		hashedPassword,
		date: new Date().getTime(),
	});

	const loginToken = createAndAddLoginToken(sanitizedUsername);

	return Result.create({
		username,
		loginToken
	});
}

async function login(username, password) {
	// Validate input
	sanitizedUsername = sanitizeUsername(username);
	let error = defaultValidation(sanitizedUsername, password);
	if(error) {
		return error;
	}
	Log.log('Account', 'login', 'Attempting to login with: ', { username, sanitizedUsername });


	// Get the user account
	const { account: userData, } = await getUser(sanitizedUsername) || {};

	const { salt = '', hashedPassword = '', username: databaseUsername} = userData;
	const loginHashedPassword = hashPassword(password, salt);
	if(hashedPassword !== loginHashedPassword && username === databaseUsername) {
		Log.log('Account', 'login', 'Login failed with: ', { username, sanitizedUsername });
		return createErrorWithKey(VALIDATION_KEYS.badUsernamePasswordLogin);
	}

	const tokenResult = await createAndAddLoginToken(sanitizedUsername);
	if(Result.isError(tokenResult)) {
		return tokenResult;
	}

	Log.log('Account', 'login', 'success with username/password: ', { username, sanitizedUsername});

	return Result.create({
		username,
		loginToken: Result.getMessage(tokenResult),
	});
}

async function loginWithToken(username, token) {
	// Input validation.  validateLoginToken() also validates username.
	const sanitizedUsername = sanitizeUsername(username);
	const validToken = validateLoginToken(username, token);
	// error from func
	if(Result.isError(validToken)) {
		return validToken;
	// token was not valid
	}

	Log.log('Account', 'loginWithToken', 'Attempting to log in with token: ', { username, sanitizedUsername, token: !!token });

	if(!validToken) {
		Log.log('Account', 'loginWithToken', 'Login token invalid: ', { username, sanitizedUsername, token: !!token });
		return createErrorWithKey(VALIDATION_KEYS.invalidToken);
	}

	// Valid token, good to go.
	const tokenResult = createAndAddLoginToken(sanitizedUsername);
	if(Result.isError(tokenResult)) {
		return tokenResult;
	}
	Log.log('Account', 'login', 'Logged in with token: ', { username, sanitizedUsername, token: !!token });
		return Result.create({
			username,
			loginToken: Result.getMessage(tokenResult),
		});
}

module.exports = {
	validated: {
		create, 
		login,
		loginWithToken,
	},
	doesUserExist, 
	getUser
};