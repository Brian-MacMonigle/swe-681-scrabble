
const COOKIE_NAME = 'swe-681-scrabble-login'

const DEFAULT_COOKIE_OPTIONS = {
	httpOnly: true,
	expires: 0, // session cookies only
}

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
		DEFAULT_COOKIE_OPTIONS,
	];
	res.cookie(
		COOKIE_NAME, 
		{
			username,
			token,
		},
		DEFAULT_COOKIE_OPTIONS
	);
	return true;
}

module.exports = { createInRes, getFromReq };