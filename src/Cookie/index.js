
const COOKIE_NAME = 'swe-681-scrabble-login';

// 7 days
const DEFAULT_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

function getFromReq(req) {
	return req && req.cookies && req.cookies[COOKIE_NAME] || false;
}

function createInRes(res, username, token) {
	const cookie = [
		COOKIE_NAME,
		{
			username,
			token,
		},
		{
			maxAge: DEFAULT_MAX_AGE,
		},
	];
	res.cookie(...cookie);
	return true;
}

function deleteInRes(res) {
	res.clearCookie(COOKIE_NAME);
}

module.exports = { createInRes, getFromReq, deleteInRes };