const _ = require("lodash");

const Account = require("../Account");
const Result = require("../APICallResult");

const Board = require("./Board");

function createNewBoard(players = []) {
	return Board.newBoard(players);
}

function isValidId(id) {
	if (Account.isValidToken(id)) {
		return Result.create({ id });
	} else {
		return Result.createError("Id is not valid or missing.");
	}
}

function validateGameData({ gameName, host, id, board, ...rest }) {
	// ensure it has specific properties, remove all others
	if (typeof gameName !== "string") {
		return Result.createError(
			'GameData requires that "gameName" be a string.'
		);
	}
	if (typeof host !== "string") {
		return Result.createError('GameData requires that "host" be a string.');
	}
	const idRes = isValidId(id);
	if (Result.isError(idRes)) {
		return Result.createError(
			'GameData requires that "id" be a string and must be set by the server.'
		);
	}
	const boardRes = Board.isValidBoard(board);
	if (Result.isError(boardRes)) {
		return Result.createError(
			`GameData requires that board be valid.  Board error: ${Result.getMessage(
				boardRes
			)}`
		);
	}
	if (_.size(rest) > 0) {
		return Result.createError(
			"GameData may not contain any additional fields."
		);
	}
	return Result.create({
		gameName,
		host,
		id,
		board
	});
}

function sanitizeGameData({ id, host, gameName, board }) {
	return {
		host,
		gameName,
		id,
		board
	};
}

function addPlayer(gameData, name) {
	return {
		...gameData,
		board: Board.addPlayersToBoard(gameData.board, [name])
	};
}

function getPlayers(gameData) {
	return Board.getPlayers(gameData.board);
}

module.exports = {
	isValidId,
	createNewBoard,
	validateGameData,
	sanitizeGameData,
	addPlayer,
	getPlayers
};
