const firebase = require("firebase");
var firebaseConfig = {
	apiKey: "AIzaSyBtDBkKYzpXYN8yvBfvxKZ1NvW6OBhF5Ic",
	authDomain: "swe-681-srabble.firebaseapp.com",
	databaseURL: "https://swe-681-srabble.firebaseio.com/",
	storageBucket: "gs://swe-681-srabble.appspot.com"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function write(path, data) {
	database
		.ref(path)
		.set(data)
		.catch(err => console.log("Error writing to database: ", err));
}

async function writeTransaction(
	path,
	callback,
	onComplete,
	applyLocally = false
) {
	return await database
		.ref(path)
		.transaction(callback, onComplete, applyLocally);
}

async function read(path) {
	return await database
		.ref(path)
		.once("value")
		.then(snapshot => snapshot.val());
}

module.exports = { read, write, writeTransaction };
