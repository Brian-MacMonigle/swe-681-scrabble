const uuid = require("uuid/v4");
const _ = require("lodash");

const Log = require("../Log");
const Result = require("../APICallResult");
const Database = require("../Database");
const Account = require("../Account");
const Games = require("../Games");

async function getGame(id) {
	const res = (await Database.read(`games/${id}`)) || {};
	if (!res) {
		return Result.createError(`Unable to find game with id ${id}`);
	}
	const gameRes = Games.validateGameData(res);
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
	const idRes = Games.isValidId(id);
	if (Result.isError(idRes)) {
		return idRes;
	}

	const usersGamesRes = await Account.validated.getUser(
		sanitizedUsername,
		"/games"
	);
	if (Result.isError(usersGamesRes)) {
		return Result.createError(
			`Was not able to retrieve game information for '${username}'`
		);
	}

	const usersGames = Result.getMessage(usersGamesRes);
	if (!_.find(usersGames, value => value === id)) {
		console.log(
			"\ngetGameWithToken: ",
			"\nusername: ",
			username,
			"\nid: ",
			id,
			"\nusersGames: ",
			usersGames
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
	const players = Games.getPlayers(game);
	if (!players.includes(username)) {
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
	sanitizedUsername,
	id,
	newData,
	removeFromUser = false
) {
	Database.write(
		`/user/${sanitizedUsername}/games/${id}`,
		removeFromUser ? null : id
	);
	Database.write(`/games/${id}`, newData);
	return Result.create(newData);
}

async function newGame(username, token, gameData) {
	const sanitizedGameData = Games.sanitizeGameData({
		gameName: gameData.gameName,
		host: username,
		id: uuid(),
		board: Games.createNewBoard([username])
	});
	const gameDataRes = Games.validateGameData(sanitizedGameData);
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
	const idRes = Games.isValidId(id);
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
	const newGame = Games.addPlayer(oldGame, username);

	const newGameError = Games.validateGameData(newGame);
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

	const players = Games.getPlayers(newGame);
	console.log("Players: ", players);

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

async function deleteGame(username, token, id) {
	const accountRes = await Account.validated.validateLoginToken(
		username,
		token
	);
	if (Result.isError(accountRes)) {
		return accountRes;
	}
	const sanitizedUsername = Account.sanitizeUsername(username);
	const idRes = Games.isValidId(id);
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
		deleteGame,
		getGame,
		getGameWithToken
	}
};
