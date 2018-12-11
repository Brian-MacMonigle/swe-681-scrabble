const uuid = require("uuid/v4");
const _ = require("lodash");

const Log = require("../Log");
const Result = require("../APICallResult");
const Database = require("../Database");
const Account = require("../Account");

// validates and adds some required fields
function validateGameData({ gameName, host, id, players, ...rest }) {
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
	if (
		!Array.isArray(players) ||
		players.length === 0 ||
		!players.find(p => p === host) ||
		[...new Set(players)].length !== players.length
	) {
		return Result.createError(
			'GameData requires that "players" be an array and must contain at least the host and contain no duplicate players.'
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
		players
	});
}

function sanitizeGameData({ id, host, players, gameName }) {
	return {
		host,
		gameName,
		players,
		id
	};
}

function isValidId(id) {
	if (Account.isValidToken(id)) {
		Result.create({ id });
	} else {
		Result.createError("Id is not valid or missing.");
	}
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
	sanitizedUsername,
	id,
	newData,
	removeFromUser = false
) {
	Database.write(
		`/user/${sanitizedUsername}/games/${id}`,
		removeFromUser ? null : true
	);
	Database.write(`/games/${id}`, newData);
	return Result.create(newData);
}

async function newGame(username, token, gameData) {
	const sanitizedGameData = sanitizeGameData({
		gameName: gameData.gameName,
		host: username,
		id: uuid(),
		players: [username]
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
	const res = await writeGameData(sanitizedUsername, id, sanitizedGameData);
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
	return Result.create({ game: sanitizedGameData });
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
			error: Result.getError(oldGameRes)
		});
		return oldGameRes;
	}

	// update game struct
	const newGame = sanitizeGameData({
		...oldGame,
		players: oldGame.players.concat(username)
	});

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

	const res = await writeGameData(sanitizedUsername, id, newGame);
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

async function quitGame(username, token, id) {
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
	Log.log("Games", "quitGame", "Attempting to quit game with: ", {
		username,
		token: !!token,
		id
	});

	// retrieve oldGame
	const oldGameRes = await getGame(id);
	const oldGame = Result.getMessage(oldGameRes);
	if (Result.isError(oldGameRes) || !oldGame) {
		Log.log("Games", "quitGame", "Could not find game with: ", {
			username,
			token: !!token,
			id,
			error: Result.getError(oldGameRes)
		});
		return oldGameRes;
	}

	// update and validate
	const newGame = sanitizeGameData({
		...oldGame,
		players: (oldGame.players || []).filter(name => name !== username)
	});
	const newGameRes = validateGameData(newGame);
	if (Result.isError(newGameRes)) {
		Log.log("Games", "quitGame", "Error with new game structure: ", {
			username,
			token: !!token,
			id,
			newGame,
			error: Result.getMessage(newGameRes)
		});
		return newGameRes;
	}

	// write to database
	const res = await writeGameData(sanitizedUsername, id, newGame, true);
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
	const res = await writeGameData(sanitizedUsername, id, null, true);
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

module.exports = {
	validated: {
		getAll,
		getUserGames,
		newGame,
		joinGame,
		quitGame,
		deleteGame,
		getGame
	}
};
