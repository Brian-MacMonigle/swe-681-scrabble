function getUrl(path) {
	const url = "/api" + path;
	return url;
}

export function getJSONFromServer(path) {
	if (typeof path !== "string") {
		return Promise.reject("path must be a string");
	}

	const options = {
		headers: {
			"Content-Type": "application/json; charset=utf-8"
		}
	};

	return fetch(getUrl(path), options)
		.then(res => res.json())
		.catch(error => ({ error }));
}

export function postJSONFromServer(path, data) {
	if (typeof path !== "string") {
		return Promise.reject("path must be a string");
	}

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	};

	return fetch(getUrl(path), options)
		.then(res => res.json())
		.catch(error => ({ error }));
}

function isError(result) {
	return !!result && !!result.error;
}

function isSuccess(result) {
	return !isError(result);
}

function getErrorMessage(result) {
	return (result && result.error) || result;
}

function getSuccessMessage(result) {
	return result && result.success;
}

function getMessage(result) {
	if (isError(result)) {
		return getErrorMessage(result);
	}
	return getSuccessMessage(result);
}

export default {
	isError,
	isSuccess,
	getErrorMessage,
	getSuccessMessage,
	getMessage
};
