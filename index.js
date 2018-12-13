const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const Result = require("./src/APICallResult");
const Cookie = require("./src/Cookie");
const Account = require("./src/Account").validated;
const Games = require("./src/Games").validated;
const GameBrowser = require("./src/GameBrowser").validated;

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
	console.log(
		"Request at path: ",
		req.path,
		"\nwith body: ",
		req.body,
		"\nwith cookie: ",
		Cookie.getFromReq(req),
		"\n"
	);
	next();
});

async function addUserData(result) {
	if (Result.isError(result)) {
		return result;
	}
	const { username, token } = Result.getMessage(result);
	const { data } = await Account.getUserData(username, token);
	return Result.create({
		...Result.getMessage(result),
		data
	});
}

function addLoginCookie(res, result) {
	if (Result.isSuccess(result)) {
		// get token from result and set as cookie.  We overwrite any existing cookie
		const { username = "", loginToken = "" } = Result.getMessage(result);
		if (!loginToken || !username) {
			throw new Error(
				"Result doesn't contain loginToken or username: " +
					JSON.stringify(result)
			);
		} else {
			Cookie.createInRes(res, username, loginToken);
		}
	}
	return result;
}

function handleInternalError(error) {
	console.error("Internal server error: ", error);
	return Result.createError("Internal server error.  Please try again.");
}

// User

app.post("/api/account/create", (req, res) => {
	const { username, password } = req.body;
	Account.create(username, password)
		.then(result => addLoginCookie(res, result))
		.then(result => addUserData(result))
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.post("/api/account/login", (req, res) => {
	const { username, password } = req.body;
	Account.login(username, password)
		.then(result => addLoginCookie(res, result))
		.then(result => addUserData(result))
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.post("/api/account/login/token", (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	Account.loginWithToken(username, token)
		.then(result => addLoginCookie(res, result))
		.then(result => addUserData(result))
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.all("/api/account/logout", (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	Cookie.deleteInRes(res);
	res.send(Result.create(`Logout of ${username} successful.`));
});

app.get("/api/account/data", (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	Account.getUserData(username, token)
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.post("/api/account/data", (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	const { ...data } = req.body;
	Account.updateUserData(username, token, data)
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

// GameBrowser

app.get("/api/games/all", (req, res) => {
	GameBrowser.getAll()
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.post("/api/games/new", (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	const { ...gameData } = req.body;
	GameBrowser.newGame(username, token, gameData)
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.post("/api/games/join", (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	const { id } = req.body;
	GameBrowser.joinGame(username, token, id)
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

// Depreciated
// Remove user from game they joined.  Can not delete non-owned games
// app.post("/api/games/quit", (req, res) => {
// 	const { username, token } = Cookie.getFromReq(req);
// 	const { id } = req.body;
// 	GameBrowser.quitGame(username, token, id)
// 		.catch(error => handleInternalError(error))
// 		.then(result => res.send(result));
// });

// Remove game from database
app.post("/api/games/delete", (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	const { id } = req.body;
	GameBrowser.deleteGame(username, token, id)
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.get("/api/games/user", (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	GameBrowser.getUserGames(username, token)
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

// Games

app.post("/api/games/board", (req, res) => {
	const { username, token } = Cookie.getFromReq(req);
	const { id } = req.body;
	console.log("req.body: ", req.body);
	GameBrowser.getGameWithToken(username, token, id)
		.catch(error => handleInternalError(error))
		.then(result => res.send(result));
});

app.post("/api/games/move", (req, res) => {
	res.send(Result.createError("Not implemented yet."));
});

// API Default

app.all("/api/*", (req, res) => {
	res.send(
		Result.createError(`The path ${req.path} is not a valid api call.`)
	);
});

// React Webpage

// If no other url called, return the react app.  Most connections will follow this route.
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
