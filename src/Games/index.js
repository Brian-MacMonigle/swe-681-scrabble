const uuid = require('uuid/v4');
const _ = require('lodash');

const Log = require('../Log');
const Result = require('../APICallResult'); 
const Database = require('../Database');
const Account = require('../Account');

function validateGameData(gameData, username) {
	// ensure it has specific properties, remove all others
	const { gameName } = gameData;
	if( 
		typeof gameName !== 'string'
	) {
		return Result.createError('GameData requires that "gameName" be a string.');
	}
	return Result.create({
		host: username,
		gameName,
		players: 1,
	});
}

async function getAll() {
	return Result.create(await Database.read('games/') || {});
}

async function getUserGames(username, token) {
	const res = Account.validated.validateLoginToken(username, token);
	if(Result.isError(res)) {
		return res;
	}

	return Result.create(await Account.getUser(username, 'games/') || {});
}

async function atomicNewGame(sanitizedUsername, gameData) {
	const newGameId = uuid();
	const newGame = {
		[newGameId]: {
			...gameData,
			id: newGameId,
		}
	};

	const res = await Database.writeTransaction(
		'/',
		(data) => {
			if(!data) {
				return data;
			}
			const { 
				games = {}, 
				user: {
					[sanitizedUsername]: {
						games: userGames = {},
					} = {},
				} = {},
			} = data;

			const res = _.merge(data, {
				games: {
					...newGame,
				},
				user: {
					[sanitizedUsername]: {
						games: {
							...newGame,
						}
					}
				}
			});
			return res;
		})
		.then(({ committed = false }) => {
			return committed;
		}).catch(error => {
			return false;
		});

	if(!res) {
		return Result.createError('Some error occurred, please try again.');
	}
	return Result.create('Created new game.');
}

async function newGame(username, token, gameData) {
	const gameDataRes = validateGameData(gameData, username);
	if(Result.isError(gameDataRes)) {
		return gameDataRes;
	}
	const sanitizedGameData = Result.getMessage(gameDataRes);

	const res = Account.validated.validateLoginToken(username, token);
	if(Result.isError(res)) {
		return res;
	}

	// Validate gameData

	return await atomicNewGame(
		Account.sanitizeUsername(username),
		sanitizedGameData
	);
}

module.exports = {
	validated: {
		getAll,
		getUserGames,
		newGame,
	},
};