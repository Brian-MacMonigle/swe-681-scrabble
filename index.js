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

function handleLoginResult(res, result) {
	if(Result.isError(result)) {
		res.send(result);
		return;
	} else {
		// get token from result and set as cookie.  We overwrite any existing cookie
		const { username = '', loginToken = ''} = Result.getMessage(result);
		if(!loginToken || !username) {
			throw new Error('Result doesn\'t contain loginToken or username: ' + JSON.stringify(result));
		} else {
			Cookie.createInRes(res, username, loginToken);	
			const cookie = [
				'some-cookie',
				{
					hello: 'world!',
				},
				{
					maxAge: 10000,
				},
			];
			res.cookie(...cookie);
			res.send(result);
		}
	}
}

function handleLoginError(res, error) {
	console.error('Internal server error: ', error);
	res.send(Result.createError('Internal server error.  Please try again.'));
}

app.post('/api/account/create', (req, res) => {
	const { username, password } = req.body;
	console.log('/api/account/create called with: ', '\nbody: ', req.body);
	Account.create(username, password)
		.then(result => handleLoginResult(res, result))
		.catch(error => handleLoginError(res, error));
});

app.post('/api/account/login', (req, res) => {
	const { username, password } = req.body;
	Account.login(username, password)
		.then(result => handleLoginResult(res, result))
		.catch(error => handleLoginError(res, error));
});

app.post('/api/account/login/token', (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	console.log('/api/account/login/token: ', '\nusername: ', username, '\ntoken: ', token);
	Account.loginWithToken(username, token)
		.then(result => handleLoginResult(res, result))
		.catch(error => handleLoginError(res, error));
})

app.get("/api/board/new", (req, res) => {
	console.log("/api/board/new");
	res.json(Board.newBoard());
});

// If no other url called, return the react app.  Most connections will follow this route.
app.get("*", (req, res) => {
	console.log(req.originalUrl);
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
