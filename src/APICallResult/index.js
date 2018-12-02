function create(message) {
	return {
		success: message,
	}
}

function createError(message) {
	return {
		error: message,
	}
}

function isError(result) {
	return !!result && !!result.error;
}

function isSuccess(result) {
	return !isError(result);
}

function getErrorMessage(result) {
	return result.error;
}

function getSuccessMessage(result) {
	return result.success;
}

function getMessage(result) {
	if(isError(result)) {
		return getErrorMessage(result);
	}
	return getSuccessMessage(result);
}

module.exports = { 
	create, 
	createError, 
	isError, 
	isSuccess, 
	getErrorMessage, 
	getSuccessMessage, 
	getMessage
};
