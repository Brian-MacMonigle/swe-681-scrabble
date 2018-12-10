import Cookies from 'js-cookie';

export function getCookie(name) {
	// For some reason cookies returned from 'js-cookie' has a 'j:' prefix in the string.
	const rawCookie = Cookies.get(name) || "j:{}";
	const cookie = JSON.parse(rawCookie.substring(2)) || {};
	return cookie;
}