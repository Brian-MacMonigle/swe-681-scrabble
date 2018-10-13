const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Hello World!\n');
});

app.listen(port, () => console.log(`Listening on port ${port}`));