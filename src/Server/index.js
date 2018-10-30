const express = require("express");
const path = require("path");

const Board = require("./Board");

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the React app (.css, .js, .png, ...)
app.use(express.static(path.join(__dirname, "build")));

app.get("/hello/world", (req, res) => {
	res.send("Hello World!\n");
});

app.get("/api/board/new", (req, res) => {
	res.send(Board.newBoard());
});

// If no other url called, return the react app.  Most connections will follow this route.
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
