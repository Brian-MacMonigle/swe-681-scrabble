import newBoard from "./newBoard.json";
import { isDevelopment } from "../Environment";

function hardCodedDevelopmentApiResponses(path) {
	const pathMap = {
		"/board/new": newBoard
	};
	return new Promise((resolve, reject) => {
		resolve(pathMap[path] || {});
	});
}

export function getJSONFromServer(path) {
	if (typeof path !== "string") {
		return Promise.reject("path must be a string");
	}

	if (isDevelopment) {
		return hardCodedDevelopmentApiResponses(path);
	}

	const url = "/api" + path;
	const options = {
		headers: {
			"Content-Type": "application/json; charset=utf-8"
		}
	};
	return fetch(url, options).then(res => res.json());
}
