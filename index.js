const express = require("express");
const path = require("path");

const Result = require('./src/APICallResult');
const Account = require('./src/Account').validated;
const Board = require("./src/Board");

const app = express();
const port = process.env.PORT || 5000;


// allows parsing of the body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the React app (.css, .js, .png, ...)
app.use(express.static(path.join(__dirname, "build")));

app.post('/api/account/create', (req, res) => {
	const { username, password } = req.body;
	Account.create(username, password)
		.then(result => {
			res.send(result);
		})
		.catch(error => {
			console.log('Interanal server error: ', error);
			res.send(Result.createError('Internal server error.  Please try again.'));
		});
});

app.post('/api/account/login', (req, res) => {
	const { username, password } = req.body;
	Account.login(username, password)
		.then(result => {
			console.log(result);
			res.send(result);
		})
		.catch(error => {
			console.log('Interanal server error: ', error);
			res.send(Result.createError('Internal server error.  Please try again.'));
		});
});

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
