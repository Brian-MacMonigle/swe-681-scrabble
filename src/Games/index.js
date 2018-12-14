const uuid = require("uuid/v4");
const _ = require("lodash");

const Log = require("../Log");
const Result = require("../APICallResult");
const Database = require("../Database");
const Account = require("../Account");

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

async function getGame(id) {
	const res = (await Database.read(`games/${id}`)) || {};
	if (!res) {
		return Result.createError(`Unable to find game with id ${id}`);
	}
	const gameRes = validateGameData(res);
	if (Result.isError(gameRes)) {
		Log.log("Games", "getGame", "Game data is corrupted: ", {
			id,
			error: Result.getMessage(gameRes)
		});
		return Result.createError("Game in database is corrupted.");
	}
	return Result.create(res);
}

async function getGameWithToken(username, token, id) {
	const accountRes = await Account.validated.validateLoginToken(
		username,
		token
	);
	if (Result.isError(accountRes)) {
		return accountRes;
	}
	const sanitizedUsername = Account.sanitizeUsername(username);
	const idRes = isValidId(id);
	if (Result.isError(idRes)) {
		return idRes;
	}

	Log.log("Games", "getGameWithToken", "Attempting to retrieve game with: ", {
		username,
		token: !!token,
		id
	});

	const usersGamesRes = await Account.validated.getUser(
		sanitizedUsername,
		"/games"
	);
	if (Result.isError(usersGamesRes)) {
		Log.log("Games", "getGameWithToken", "Unable to get account data: ", {
			username,
			token: !!token,
			id,
			error: Result.getMessage(usersGamesRes)
		});
		return Result.createError(
			`Was not able to retrieve game information for '${username}'`
		);
	}

	const usersGames = Result.getMessage(usersGamesRes);
	if (!_.find(usersGames, value => value === id)) {
		Log.log(
			"Games",
			"getGameWithToken",
			"Unable to find game id within users's games: ",
			{
				username,
				token: !!token,
				id,
				usersGames
			}
		);
		return Result.createError(
			`The user '${username}' has not joined the game '${id}'.`
		);
	}

	const gameRes = await getGame(id);
	if (Result.isError(gameRes)) {
		return gameRes;
	}
	const game = Result.getMessage(gameRes);
	const players = getPlayers(game);
	if (
		!players.find(
			player => Account.sanitizeUsername(player) === sanitizedUsername
		)
	) {
		Log.log(
			"Games",
			"getGameWithToken",
			`Unable to find username within games players: `,
			{ username, token: !!token, players }
		);
		return Result.createError(
			`The user '${username}' has not joined the game '${id}'.`
		);
	}

	return Result.create(game);
}

async function getAll() {
	return Result.create((await Database.read("games/")) || {});
}

async function getUserGames(username, token) {
	const res = Account.validated.validateLoginToken(username, token);
	if (Result.isError(res)) {
		return res;
	}

	const sanitizeduserName = Account.sanitizeUsername(username);

	const gameIds = (await Account.getUser(sanitizeduserName, "games/")) || {};
	const games = (await Promise.all(
		_.map(Result.getMessage(gameIds), async (value, id) => {
			const gameRes = await getGame(id);
			if (Result.isError(gameRes)) {
				return undefined;
			}
			return Result.getMessage(gameRes);
		})
		// ensure game exists
	)).filter(game => game);
	return Result.create(games);
}

async function writeGameData(
	id,
	newData,
	sanitizedUsername,
	removeFromUser = false
) {
	Database.write(`/games/${id}`, newData);
	if (sanitizedUsername) {
		Database.write(
			`/user/${sanitizedUsername}/games/${id}`,
			removeFromUser ? null : id
		);
	}
	return Result.create(newData);
}

async function newGame(username, token, gameData) {
	const sanitizedGameData = sanitizeGameData({
		gameName: gameData.gameName,
		host: username,
		id: uuid(),
		board: createNewBoard([username])
	});
	const gameDataRes = validateGameData(sanitizedGameData);
	if (Result.isError(gameDataRes)) {
		return gameDataRes;
	}

	const accountRes = await Account.validated.validateLoginToken(
		username,
		token
	);
	if (Result.isError(accountRes)) {
		return accountRes;
	}
	const sanitizedUsername = Account.sanitizeUsername(username);

	Log.log("Games", "newGame", "Attempting to create new game with: ", {
		username,
		token: !!token,
		gameData
	});

	const { id } = sanitizedGameData;
	const res = await writeGameData(id, sanitizedGameData, sanitizedUsername);
	if (Result.isError(res)) {
		Log.log("Games", "newGame", "Failed to create new game with: ", {
			username,
			token: !!token,
			gameData,
			sanitizedGameData,
			error: Result.getMessage(res)
		});
		return res;
	}
	Log.log("Games", "newGame", "Successfully created new game with: ", {
		username,
		token: !!token,
		gameData,
		sanitizedGameData
	});
	return Result.create(sanitizedGameData);
}

async function joinGame(username, token, id) {
	const accountRes = await Account.validated.validateLoginToken(
		username,
		token
	);
	if (Result.isError(accountRes)) {
		return accountRes;
	}
	const sanitizedUsername = Account.sanitizeUsername(username);
	const idRes = isValidId(id);
	if (Result.isError(idRes)) {
		return idRes;
	}

	// validated inputs
	Log.log("Games", "joinGame", "Attempting to join game with: ", {
		username,
		token: !!token,
		id
	});

	// Now ensure id is part of the database
	const oldGameRes = await getGame(id);
	const oldGame = Result.getMessage(oldGameRes);
	if (Result.isError(oldGameRes) || !oldGame) {
		Log.log("Games", "joinGame", "Could not find game with: ", {
			username,
			token: !!token,
			id,
			error: Result.getMessage(oldGameRes)
		});
		return oldGameRes;
	}

	// update game struct
	const newGame = addPlayer(oldGame, username);

	const newGameError = validateGameData(newGame);
	if (Result.isError(newGameError)) {
		Log.log("Games", "joinGame", "Failed to validate new game data: ", {
			username,
			toekn: !!token,
			id,
			newGame,
			error: Result.getMessage(newGameError)
		});
		return newGameError;
	}

	const players = getPlayers(newGame);

	const res = await writeGameData(id, newGame, sanitizedUsername);
	if (Result.isError(res)) {
		Log.log("Games", "newGame", "Failed to create new game with: ", {
			username,
			token: !!token,
			gameData,
			sanitizedGameData,
			error: Result.getMessage(res)
		});
		return res;
	}
	Log.log("Games", "joinGame", "Successfully joined game with: ", {
		username,
		token: !!token,
		id,
		newGame
	});
	return Result.create(newGame);
}

async function deleteGame(username, token, id) {
	const accountRes = await Account.validated.validateLoginToken(
		username,
		token
	);
	if (Result.isError(accountRes)) {
		return accountRes;
	}
	const sanitizedUsername = Account.sanitizeUsername(username);
	const idRes = isValidId(id);
	if (Result.isError(idRes)) {
		return idRes;
	}

	// inputs validated
	Log.log("Games", "deleteGame", "Attempting to delete game with: ", {
		username,
		token: !!token,
		id
	});

	// write to database
	const res = await writeGameData(id, null, sanitizedUsername, true);
	if (Result.isError(res)) {
		Log.log("Games", "newGame", "Failed to create new game with: ", {
			username,
			token: !!token,
			gameData,
			sanitizedGameData,
			error: Result.getMessage(res)
		});
		return res;
	}
	Log.log("Games", "quitGame", "Successfully quit game with: ", {
		username,
		token: !!token,
		id
	});
	return Result.create(`Deleted game with id ${id}.`);
}

async function move(
	username,
	token,
	id,
	player,
	word,
	row,
	column,
	right = false,
	down = false
) {
	// fetch board
	const gameRes = await getGameWithToken(username, token, id);
	if (Result.isError(gameRes)) {
		return gameRes;
	}
	const oldGame = Result.getMessage(gameRes);
	const {
		board: oldBoard,
		board: { players: oldPlayers = [] } = {}
	} = oldGame;

	if (oldPlayers.length < 2) {
		return Result.createError(
			"You must have at least two players before you can start playing."
		);
	}

	if (
		typeof player !== "string" ||
		username.toLowerCase() !== player.toLowerCase()
	) {
		return Result.createError(
			"Only the player may make a move for that player."
		);
	}

	if (typeof word !== "string" || word.length <= 0) {
		return Result.createError("Word can not be empty");
	}
	const sanitizedWord = word.toUpperCase();

	if (
		!Number.isInteger(row) ||
		!Number.isInteger(column) ||
		row < 0 ||
		row >= 15 ||
		column < 0 ||
		column >= 15
	) {
		return Result.createError(
			"Row and Column params must be within [0,14]."
		);
	}

	// ensure only right or down is true
	if ((right && down) || (!right && !down)) {
		return Result.creatError(
			"Only right OR down may be true at any one time."
		);
	}

	if (typeof word !== "string" && word.length > 0) {
		return Result.createError("Word must be a non-empty string.");
	}

	Log.log("Games", "move", "Attempting to move with: ", {
		username,
		token: !!token,
		id,
		player,
		word,
		sanitizedWord,
		row,
		column,
		right,
		down
	});

	const oldBoardRes = Board.isValidBoard(oldBoard);
	if (Result.isError(oldBoardRes)) {
		Log.log("Games", "move", "Old board is corrupted: ", {
			username,
			token: !!token,
			id,
			player,
			word,
			sanitizedWord,
			row,
			column,
			right,
			down,
			board: oldBoard,
			error: Result.getMessage(oldBoardRes)
		});
		return Result.createError("Current board is corrupted.");
	}

	const validMoveRes = Board.isValidMove({
		board: oldBoard,
		player,
		word: sanitizedWord,
		row,
		column,
		right,
		down
	});
	if (Result.isError(validMoveRes)) {
		Log.log("Games", "move", "Not a valid move: ", {
			username,
			token: !!token,
			id,
			player,
			word,
			sanitizedWord,
			row,
			column,
			right,
			down,
			board: oldBoard,
			error: Result.getMessage(validMoveRes)
		});
		return validMoveRes;
	}
	const newBoardRes = Board.move({
		board: oldBoard,
		player,
		word: sanitizedWord,
		row,
		column,
		right,
		down
	});
	if (Result.isError(newBoardRes)) {
		Log.log("Games", "move", "Move failed: ", {
			username,
			token: !!token,
			id,
			player,
			word,
			sanitizedWord,
			row,
			column,
			right,
			down,
			error: Result.getMessage(newBoardRes)
		});
		return newBoardRes;
	}

	const newGameDataRes = validateGameData({
		...oldGame,
		board: Result.getMessage(newBoardRes)
	});
	if (Result.isError(newGameDataRes)) {
		Log.log("Games", "move", "New game data got corrupted: ", {
			username,
			token: !!token,
			id,
			player,
			word,
			sanitizedWord,
			row,
			column,
			right,
			down,
			error: Result.getMessage(newGameDataRes)
		});
		return Result.createError("New game data got corrupted.");
	}

	writeGameData(id, Result.getMessage(newGameDataRes));
	Log.log("Games", "move", "Successfully added word to board: ", {
		username,
		token: !!token,
		id,
		player,
		word,
		sanitizedWord,
		row,
		column,
		right,
		down,
		gameData: Result.getMessage(newGameDataRes)
	});
	return Result.create("Successfully added word to board.");
}

module.exports = {
	validated: {
		getAll,
		getUserGames,
		newGame,
		joinGame,
		deleteGame,
		getGame,
		getGameWithToken,
		move
	},
	isValidId,
	createNewBoard,
	validateGameData,
	sanitizeGameData,
	addPlayer,
	getPlayers
};
