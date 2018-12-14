const shajs = require("sha.js");
const uuid = require("uuid/v4");

const Log = require("../Log");
const Result = require("../APICallResult");
const Database = require("../Database");

function hash(toHash) {
	return shajs("sha512")
		.update(toHash)
		.digest("hex");
}

// 7 days
const TOKEN_EXPARATION_TIME = 1000 * 60 * 60 * 24 * 7;

const VALIDATION_KEYS = {
	invalidUsername: "INVALID_USERNAME",
	invalidPassword: "INVALID_PASSWORD",
	invalidToken: "INVALID_TOKEN",
	usernameAlreadyExists: "USERNAME_ALREADY_EXISTS",
	badUsernamePasswordLogin: "BAD_USERNAME_PASSWORD_LOGIN",
	internalServerError: "INTERNAL_SERVER_ERROR"
};

const ERROR_MESSAGES = {
	[VALIDATION_KEYS.invalidUsername]:
		"The username you have entered is invalid.  Please make sure it is between 3 and 256 characters and it only contains letters, numbers, and the characters ',', '@', '.'.",
	[VALIDATION_KEYS.invalidPassword]:
		"The password you have entered is invalid.  Your password may be between 3 and 256 characters long and only contain letters, numbers, spaces, and the symbols '!', '\"', '#', '$', '%', '&', ''', '(', ')', '*', '+', ',', '\\', '/', ':', ';', '<', '=', '>', '@', '[', ']', '^', '_', '`', '{', '|', '}', '~'.",
	[VALIDATION_KEYS.invalidToken]:
		"The token has expired.  Please login with your username and password.",
	[VALIDATION_KEYS.usernameAlreadyExists]:
		"The username you have entered already exists.  Please try a different username.",
	[VALIDATION_KEYS.badUsernamePasswordLogin]:
		"The username and password combination is incorrect.",
	[VALIDATION_KEYS.internalServerError]:
		"There was an internal server error.  Please try again."
};

function createErrorWithKey(key) {
	return Result.createError(ERROR_MESSAGES[key]);
}

function sanitizeUsername(username = "") {
	return username.replace(/[.]/g, ",").toLowerCase();
}

function isValidUsername(username) {
	if (typeof username !== "string") {
		return false;
	}
	return !!username.match(/^[A-Za-z0-9,@]{3,256}$/g);
}

function isValidPassword(password) {
	if (typeof password !== "string") {
		return false;
	}
	return !!password.match(
		/^[A-Za-z0-9 !"#$%&'()*+,\-.\/:;<=>?@[\]^_`{|}~]{3,256}$/g
	);
}

function isValidToken(token) {
	if (typeof token !== "string") {
		return false;
	}
	return !!token.match(/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/g);
}

// [{ value: <input>, func: <validation function> }...]
// Returns false if all valid
// Otherwise returns key of the failing input
function validateInputs(...callsArray) {
	const res = callsArray.find(({ value, func, key }) => !func(value));
	if (res === undefined) {
		return Result.create(false);
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
			key: VALIDATION_KEYS.invalidPassword
		}
	];
}

function defaultValidation(username, password) {
	return validateInputs(...defaultValidationStruct(username, password));
}

async function getUser(username, pathToData = "") {
	const sanitizedUsername = sanitizeUsername(username);
	const error = validateInputs({
		value: sanitizedUsername,
		func: isValidUsername,
		key: VALIDATION_KEYS.invalidUsername
	});
	if (Result.isError(error)) {
		return error;
	}
	return Result.create(
		await Database.read(
			`user/${sanitizedUsername}${pathToData ? `/${pathToData}` : ""}`
		)
	);
}

async function doesUserExist(username) {
	const res = await getUser(username);
	if (Result.isError(res)) {
		return res;
	} else if (!Result.getMessage(res)) {
		return Result.createError(false);
	} else {
		Result.create(true);
	}
}

function writeUser(username, pathToData = "", data) {
	Database.write(`user/${username}/${pathToData}`, data);
}

async function writeUserTransaction(
	username,
	pathToData = "",
	callback,
	onComplete
) {
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

async function createAndAddLoginToken(sanitizedUsername) {
	Log.log("Account", "createAndAddLoginToken", "Creating for: ", {
		sanitizedUsername
	});
	const loginToken = createValidationToken();
	const res = await writeUserTransaction(
		sanitizedUsername,
		"/account/tokens",
		tokens => {
			const now = new Date();
			const token = {
				token: loginToken,
				date: now.getTime()
			};
			const result = (tokens && tokens.concat(token)) || [token];
			return result.reduce((acc, token) => {
				const { date } = token;
				if (date + TOKEN_EXPARATION_TIME < now) {
					return acc;
				}
				return acc.concat(token);
			}, []);
		}
	)
		.then(({ committed = false }) => {
			return committed;
		})
		.catch(error => {
			Log.log(
				"Account",
				"createAndAddLoginToken",
				"error adding token: ",
				{ sanitizedUsername, error }
			);
			return false;
		});
	if (!res) {
		return createErrorWithKey(VALIDATION_KEYS.internalServerError);
	}
	Log.log("Account", "createAndAddLoginToken", "Login token added for: ", {
		sanitizedUsername
	});
	return Result.create(loginToken);
}

async function validateLoginToken(username, token) {
	// Validate input
	sanitizedUsername = sanitizeUsername(username);
	const error = validateInputs(
		{
			value: sanitizedUsername,
			func: isValidUsername,
			key: VALIDATION_KEYS.invalidUsername
		},
		{
			value: token,
			func: isValidToken,
			key: VALIDATION_KEYS.invalidToken
		}
	);
	if (Result.isError(error)) {
		return Result.createError("Unable to log in with cookie.");
	}

	Log.log("Account", "validateLoginToken", "Attempting to validate with: ", {
		username,
		token: !!token
	});

	// validated, assume no error from getUser()
	const userRes = (await getUser(sanitizedUsername, "/account/tokens")) || [];
	if (Result.isError(userRes)) {
		return userRes;
	}
	const tokens = Result.getMessage(userRes) || [];
	const res = !!tokens.find(({ t }) => token.token === t);
	if (!res) {
		Log.log(
			"Account",
			"validateLoginToken",
			"Token did not exist for the user with: ",
			{ username, token: !!token }
		);
		return Result.createError(res);
	}
	Log.log("Account", "validateLoginToken", "Successfully validated with: ", {
		username,
		token: !!token
	});
	return Result.create(res);
}

async function create(username, password) {
	// Validate input
	sanitizedUsername = sanitizeUsername(username);
	const error = defaultValidation(sanitizedUsername, password);
	if (Result.isError(error)) {
		return error;
	}

	Log.log("Account", "create", "Attempt to create with: ", {
		username,
		sanitizedUsername
	});

	// ensure account doesn't already exist
	const userExistError = await doesUserExist(sanitizedUsername);
	if (Result.isSuccess(userExistError)) {
		// user data already found
		Log.log("Account", "create", "Account already exists for: ", {
			username,
			sanitizedUsername
		});
		return createErrorWithKey(VALIDATION_KEYS.usernameAlreadyExists);
	}

	// Good to create user
	const salt = createSalt();
	const hashedPassword = hashPassword(password, salt);
	Log.log("Account", "create", "Created account: ", {
		username,
		sanitizedUsername
	});
	writeUser(sanitizedUsername, "account", {
		username,
		sanitizedUsername,
		salt,
		hashedPassword,
		date: new Date().getTime()
	});

	const tokenRes = await createAndAddLoginToken(sanitizedUsername);
	if (Result.isError(tokenRes)) {
		return tokenRes;
	}

	return Result.create({
		username,
		loginToken: Result.getMessage(tokenRes)
	});
}

async function login(username, password) {
	// Validate input
	sanitizedUsername = sanitizeUsername(username);
	let error = defaultValidation(sanitizedUsername, password);
	if (Result.isError(error)) {
		return error;
	}
	Log.log("Account", "login", "Attempting to login with: ", {
		username,
		sanitizedUsername
	});

	// Get the user account
	// already validated, assume no error from getUser()
	const { account: userData = {} } = (await getUser(sanitizedUsername)) || {};

	const {
		salt = "",
		hashedPassword = "",
		username: databaseUsername
	} = userData;
	const loginHashedPassword = hashPassword(password, salt);
	if (
		hashedPassword !== loginHashedPassword &&
		username === databaseUsername
	) {
		Log.log("Account", "login", "Login failed with: ", {
			username,
			sanitizedUsername
		});
		return createErrorWithKey(VALIDATION_KEYS.badUsernamePasswordLogin);
	}

	const tokenResult = await createAndAddLoginToken(sanitizedUsername);
	if (Result.isError(tokenResult)) {
		return tokenResult;
	}

	Log.log("Account", "login", "success with username/password: ", {
		username,
		sanitizedUsername
	});

	return Result.create({
		username,
		loginToken: Result.getMessage(tokenResult)
	});
}

async function loginWithToken(username, token) {
	const res = validateLoginToken(username, token);
	if (Result.isError(res)) {
		return res;
	}

	// Valid token, good to go.
	return Result.create({
		username,
		loginToken: token
	});
}

async function getUserData(username, token) {
	const res = validateLoginToken(username, token);
	if (Result.isError(res)) {
		return res;
	}

	const { data = {} } = await getUser(username);

	Log.log("Account", "getUserData", "Retrieved user data: ", {
		username,
		sanitizedUsername,
		data
	});

	return Result.create({
		data
	});
}

async function updateUserData(username, token, data) {
	const res = validateLoginToken(username, token);
	if (Result.isError(res)) {
		return res;
	}

	writeUser(username, "/data", data);

	return Result.create("Wrote data to server.");
}

module.exports = {
	validated: {
		create,
		login,
		loginWithToken,
		doesUserExist,
		getUser,
		getUserData,
		updateUserData,
		validateLoginToken
	},
	sanitizeUsername,
	getUser,
	isValidToken
};
