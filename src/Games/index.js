const uuid = require('uuid/v4');
const _ = require('lodash');

const Log = require('../Log');
const Result = require('../APICallResult'); 
const Database = require('../Database');
const Account = require('../Account');

async function getAll() {
	return Result.create(await Database.read('games/') || {});
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
	const res = Account.validateDataRequest(username, token);
	if(Result.isError(res)) {
		return res;
	}

	return await atomicNewGame(
		Account.sanitizeUsername(username),
		gameData
	);
}

module.exports = {
	validated: {
		getAll,
		newGame,
	},
};