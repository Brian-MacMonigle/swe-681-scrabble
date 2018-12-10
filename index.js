const express = require("express");
const cookieParser = require('cookie-parser');
const path = require("path");

const Result = require('./src/APICallResult');
const Cookie = require('./src/Cookie');
const Account = require('./src/Account').validated;
const Board = require("./src/Board");

const app = express();
const port = process.env.PORT || 5000;


// allows parsing of the body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// allows cookies
app.use(cookieParser());
// Serve static files from the React app (.css, .js, .png, ...)
app.use(express.static(path.join(__dirname, "build")));

// Console.log all requests for debugging
app.use((req, res, next) => {
	console.log('Request at path: ', req.path, '\nwith body: ', req.body);
	next();
});

async function addUserData(result) {
	if(Result.isError(result)) {
		return result;
	}
	const { username, token } = Result.getMessage(result);
	const { data } = await Account.getUserData(username, token);
	return Result.create({
		...Result.getMessage(result),
		data,
	});
}

function addLoginCookie(res, result) {
	if(Result.isSuccess(result)) {
		// get token from result and set as cookie.  We overwrite any existing cookie
		const { username = '', loginToken = ''} = Result.getMessage(result);
		if(!loginToken || !username) {
			throw new Error('Result doesn\'t contain loginToken or username: ' + JSON.stringify(result));
		} else {
			Cookie.createInRes(res, username, loginToken);	
		}
	}
	return result;
}

function handleInternalError(error) {
	console.error('Internal server error: ', error);
	return Result.createError('Internal server error.  Please try again.');
}

app.post('/api/account/create', (req, res) => {
	const { username, password } = req.body;
	console.log('/api/account/create called with: ', '\nbody: ', req.body);
	Account.create(username, password)
		.then(result => addLoginCookie(res, result))
		.then(result => addUserData(result))
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.post('/api/account/login', (req, res) => {
	const { username, password } = req.body;
	Account.login(username, password)
		.then(result => addLoginCookie(res, result))
		.then(result => addUserData(result))
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.post('/api/account/login/token', (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	Account.loginWithToken(username, token)
		.then(result => addLoginCookie(res, result))
		.then(result => addUserData(result))
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
})

app.all('/api/account/logout', (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	if(username && token) {
		Cookie.deleteInRes(res);
		res.send(Result.create(`Logout of ${username} successful.`));
	} else {
		res.send(Result.error(`Was not able to logout due to missing or corruped cookie.`));
	}
});

app.get('/api/account/data', (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	Account.getUserData(username, token)
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

// TODO: Needs testing!
app.post('/api/account/data', (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	const { ...data } = req.body;
	Account.updateUserData(username, token, data)
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.get("/api/board/new", (req, res) => {
	res.json(Board.newBoard());
});

app.get('/api/games/all', (req, res) => {
	res.send(Result.createError('Not implemented yet'));
});

app.all("/api/*", (req, res) => {
	res.send(Result.createError(
		`The path ${req.path} is not a valid api call.`
	));
});

// If no other url called, return the react app.  Most connections will follow this route.
app.get("*", (req, res) => {
	console.log(req.originalUrl);
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
