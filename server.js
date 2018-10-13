const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the React app (.css, .js, .png, ...)
app.use(express.static(path.join(__dirname, 'react-app', 'build')));

app.get('/hello/world', (req, res) => {
	res.send('Hello World!\n');
});

function validateNumber({num, min, max, infinityAllowed = false, def = null}) {
	if(typeof num !== 'number') {
		return def;
	}
	if(!infinityAllowed) {
		if(!isFinite(num)) {
			return def;
		}
	}
	// if min or max undefined, evaluates to false
	if(num < min) {
		return min;
	}
	if(num > max) {
		return max;
	}
	return num;
}

// Expects URL params (/url?param1=value1&param2=value2&param3=value3).
// Inputs: amount, min, max
// Accepts any combination of input values
app.get('/list/random', (req, res) => {
	let {query: { amount, min, max} = {}} = req;
	amount = validateNumber({num: parseInt(amount), min: 1, def: 1});
	min = validateNumber({num: parseInt(min), def: 0});
	max = validateNumber({num: parseInt(max), def: 1});

	const range = max - min;

	// populate result
	const result = [];
	for(let i = 0; i < amount; i++) {
		result.push(Math.random() * range + min);
	}

	res.send(result);
});

// If no other url called, return the react app.  Most connections will follow this route.
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'react-app', 'build', 'index.html'));
});

app.listen(port, () => console.log(`Listening on port ${port}`));