const shajs = require('sha.js');
const uuid = require('uuid/v4');

const Log = require('../Log');
const Result = require('../APICallResult'); 
const Database = require('../Database');

function hash(toHash) {
	return shajs('sha512').update(toHash).digest('hex');
}

const VALIDATION_KEYS = {
	invalidUsername: 'INVALID_USERNAME',
	invalidPassword: 'INVALID_PASSWORD',
	usernameAlreadyExists: 'USERNAME_ALREADY_EXISTS',
	badUsernamePasswordLogin: 'BAD_USERNAME_PASSWORD_LOGIN',
	internalServerError: 'INTERNAL_SERVER_ERROR',
}

const ERROR_MESSAGES = {
	[VALIDATION_KEYS.invalidUsername]: "The username you have entered is invalid.  Please make sure it only contains letters, numbers, and the characters ',', '@', '.'.",
	[VALIDATION_KEYS.invalidPassword]: 'The password you have entered is invalid.  [TODO: add definition for valid password]',
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
	return !!username.match(/^[A-Za-z0-9,@]+$/g);
}

function isValidPassword(password) {
	return true;
}

// [{ value: <input>, func: <validation function> }...]
// Returns false if all valid
// Otherwise returns key of the failing input
function validateInputs(callsArray = []) {
	const res = callsArray.find((({value, func, key}) => !func(value)));
	if(res === undefined) {
		return false;
	}
	return createErrorWithKey(res.key);
}

function defaultValidation(username, password) {
	return validateInputs([
		{
			value: username,
			func: isValidUsername,
			key: VALIDATION_KEYS.invalidUsername,
		},
		{
			value: password,
			func: isValidPassword,
			key: VALIDATION_KEYS.invalidPassword,
		}
	]);
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
			if(tokens) {
				tokens.push(loginToken);
			}
			return tokens || [loginToken];
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

// TODO: untested
async function validateLoginToken(username, token) {
	// Validate input
	sanitizedUsername = sanitizedUsername(username);
	const errKey = validateInputs({ value: username, func: isValidUsername, key: VALIDATION_KEYS.invalidUsername})
	if(errKey) {
		return errKey;
	}

	const tokens = await getUser(username, '/account/tokens');
	return tokens.includes(token);
}

async function create(username, password) {
	// Validate input
	sanitizedUsername = sanitizeUsername(username);
	const errKey = defaultValidation(sanitizedUsername, password);
	if(errKey) {
		return errKey;
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
		date: new Date(),
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
	const errKey = defaultValidation(sanitizedUsername, password);
	if(errKey) {
		return errKey;
	}
	Log.log('Account', 'login', 'Attempting to login with: ', { username, sanitizedUsername });

	// Get the user account
	const { account: userData, } = await getUser(sanitizedUsername) || {};

	const { salt = '', hashedPassword = '', username: databaseUsername} = userData;
	const loginHashedPassword = hashPassword(password, salt);
	if(hashedPassword !== loginHashedPassword && username === databaseUsername) {
		Log.log('Account', 'login', 'Login failed.');
		return createErrorWithKey(VALIDATION_KEYS.badUsernamePasswordLogin);
	}

	const tokenResult = await createAndAddLoginToken(sanitizedUsername);
	if(Result.isError(tokenResult)) {
		return tokenResult;
	}

	Log.log('Account', 'login', 'success with: ', { username, sanitizedUsername });

	return Result.create({
		username,
		loginToken: Result.getMessage(tokenResult),
	});
}

module.exports = {
	validated: {
		create, 
		login,
		validateLoginToken,
	},
	doesUserExist, 
	getUser
};