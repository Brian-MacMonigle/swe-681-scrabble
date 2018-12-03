const Database = require('../Database');

function padZeros(toPad = "", pad = 0) {
	const res = `${toPad}`;
	return res.padStart(pad, '0');
}

function log(...data) {
	const date = new Date();
	const year = padZeros(date.getFullYear(), 4);
	// Month range is 0-11, we want 1-12.
	const month = padZeros(date.getMonth() + 1, 2);
	const day = padZeros(date.getDate(), 2);
	const hours = padZeros(date.getHours(), 2);
	const minutes = padZeros(date.getMinutes(), 2);
	const seconds = padZeros(date.getSeconds(), 2);
	const miliseconds = padZeros(date.getMilliseconds(), 3);

	const path = `log/${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${miliseconds}`;
	const dataRes = { ...data };

	console.log(path, '\n', dataRes, '\n');
	Database.write(path, dataRes);
}

function DELETE_ALL_LOGS() {
	Database.write('log', null);
}

module.exports = { log };