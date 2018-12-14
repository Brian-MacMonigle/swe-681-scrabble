const Random = require("random-js");
const random = new Random(Random.engines.browserCrypto);
const _ = require("lodash");

const Result = require("../APICallResult");

const { validWord } = require("./AllWords");

const DEFAULT_NUMBER_OF_PLAYER_TILES = 7;

const tile = {
	letterPoints: 1,
	wordPoints: 1,
	letter: "",
	startTile: false,
	playerTile: null
};

const doubleLetterTile = {
	...tile,
	letterPoints: 2
};

const tripleLetterTile = {
	...tile,
	letterPoints: 3
};

const doubleWordTile = {
	...tile,
	wordPoints: 2
};

const tripleWordTile = {
	...tile,
	wordPoints: 3
};

const startTile = {
	...tile,
	startTile: true,
	wordPoints: 2
};

const tileTypes = [
	tile,
	doubleLetterTile,
	tripleLetterTile,
	doubleWordTile,
	tripleWordTile,
	startTile
];

const row0 = [
	tripleWordTile,
	tile,
	tile,
	doubleLetterTile,
	tile,
	tile,
	tile,
	tripleWordTile,
	tile,
	tile,
	tile,
	doubleLetterTile,
	tile,
	tile,
	tripleWordTile
];

const row1 = [
	tile,
	doubleWordTile,
	tile,
	tile,
	tile,
	tripleLetterTile,
	tile,
	tile,
	tile,
	tripleLetterTile,
	tile,
	tile,
	tile,
	doubleWordTile,
	tile
];

const row2 = [
	tile,
	tile,
	doubleWordTile,
	tile,
	tile,
	tile,
	doubleLetterTile,
	tile,
	doubleLetterTile,
	tile,
	tile,
	tile,
	doubleWordTile,
	tile,
	tile
];

const row3 = [
	doubleLetterTile,
	tile,
	tile,
	doubleWordTile,
	tile,
	tile,
	tile,
	doubleLetterTile,
	tile,
	tile,
	tile,
	doubleWordTile,
	tile,
	tile,
	doubleLetterTile
];

const row4 = [
	tile,
	tile,
	tile,
	tile,
	doubleWordTile,
	tile,
	tile,
	tile,
	tile,
	tile,
	doubleWordTile,
	tile,
	tile,
	tile,
	tile
];

const row5 = [
	tile,
	tripleLetterTile,
	tile,
	tile,
	tile,
	tripleLetterTile,
	tile,
	tile,
	tile,
	tripleLetterTile,
	tile,
	tile,
	tile,
	tripleLetterTile,
	tile
];

const row6 = [
	tile,
	tile,
	doubleLetterTile,
	tile,
	tile,
	tile,
	doubleLetterTile,
	tile,
	doubleLetterTile,
	tile,
	tile,
	tile,
	doubleLetterTile,
	tile,
	tile
];

const row7 = [
	tripleWordTile,
	tile,
	tile,
	doubleLetterTile,
	tile,
	tile,
	tile,
	startTile,
	tile,
	tile,
	tile,
	doubleLetterTile,
	tile,
	tile,
	tripleWordTile
];

const blankPlayerTile = {
	letter: " ",
	points: 0
};

const EPlayerTile = {
	letter: "E",
	points: 1
};

const APlayerTile = {
	letter: "A",
	points: 1
};

const IPlayerTile = {
	letter: "I",
	points: 1
};

const OPlayerTile = {
	letter: "O",
	points: 1
};

const NPlayerTile = {
	letter: "N",
	points: 1
};

const RPlayerTile = {
	letter: "R",
	points: 1
};

const TPlayerTile = {
	letter: "T",
	points: 1
};

const LPlayerTile = {
	letter: "L",
	points: 1
};

const SPlayerTile = {
	letter: "S",
	points: 1
};

const UPlayerTile = {
	letter: "U",
	points: 1
};

const DPlayerTile = {
	letter: "D",
	points: 2
};

const GPlayerTile = {
	letter: "G",
	points: 2
};

const BPlayerTile = {
	letter: "B",
	points: 3
};

const CPlayerTile = {
	letter: "C",
	points: 3
};

const MPlayerTile = {
	letter: "M",
	points: 3
};

const PPlayerTile = {
	letter: "F",
	points: 3
};

const FPlayerTile = {
	letter: "F",
	points: 4
};

const HPlayerTile = {
	letter: "H",
	points: 4
};

const VPlayerTile = {
	letter: "V",
	points: 4
};

const WPlayerTile = {
	letter: "W",
	points: 4
};

const YPlayerTile = {
	letter: "Y",
	points: 4
};

const KPlayerTile = {
	letter: "K",
	points: 5
};

const JPlayerTile = {
	letter: "J",
	points: 8
};

const XPlayerTile = {
	letter: "X",
	points: 8
};

const QPlayerTile = {
	letter: "Q",
	points: 10
};

const ZPlayerTile = {
	letter: "Z",
	points: 10
};

const ALL_PLAYER_TILES_COUNT = 100;

const allPlayerTiles = [
	...Array(12).fill(EPlayerTile),
	...Array(9).fill(APlayerTile),
	...Array(9).fill(IPlayerTile),
	...Array(8).fill(OPlayerTile),
	...Array(6).fill(NPlayerTile),
	...Array(6).fill(RPlayerTile),
	...Array(6).fill(TPlayerTile),
	...Array(4).fill(LPlayerTile),
	...Array(4).fill(SPlayerTile),
	...Array(4).fill(UPlayerTile),

	...Array(4).fill(DPlayerTile),
	...Array(3).fill(GPlayerTile),

	...Array(2).fill(BPlayerTile),
	...Array(2).fill(CPlayerTile),
	...Array(2).fill(MPlayerTile),
	...Array(2).fill(PPlayerTile),

	...Array(2).fill(FPlayerTile),
	...Array(2).fill(HPlayerTile),
	...Array(2).fill(VPlayerTile),
	...Array(2).fill(WPlayerTile),
	...Array(2).fill(YPlayerTile),

	KPlayerTile,

	JPlayerTile,
	XPlayerTile,

	QPlayerTile,
	ZPlayerTile
];

function getNewPlayerTiles() {
	return JSON.parse(JSON.stringify({ tiles: allPlayerTiles })).tiles;
}

// Modifies allPlayerTiles
function getRandomPlayerTile(allPlayerTiles) {
	if (allPlayerTiles.length === 0) {
		return Result.createError("Empty Bag of tiles.");
	}
	const tileIndex = random.integer(0, allPlayerTiles.length);
	return Result.create(allPlayerTiles.splice(tileIndex, 1)[0]);
}

function newBoard(players = []) {
	let board = JSON.parse(
		JSON.stringify({
			tiles: [
				row0,
				row1,
				row2,
				row3,
				row4,
				row5,
				row6,
				row7,
				row6,
				row5,
				row4,
				row3,
				row2,
				row1,
				row0
			],
			players: [],
			playerTiles: getNewPlayerTiles(),
			turnCount: 0
		})
	);
	if (players.length > 0) {
		board = addPlayersToBoard(board, players);
	}
	return board;
}

function cloneBoard(board) {
	return JSON.parse(JSON.stringify(board || {}));
}

function addPlayersToBoard(board = {}, users = []) {
	const { players: oldPlayers, playerTiles } = cloneBoard(board);
	const players = oldPlayers;
	users.forEach(player => {
		players.push({
			name: player,
			// DEFAULT_NUMBER_OF_PLAYER_TILES
			tiles: [0, 0, 0, 0, 0, 0, 0].map(() => ({
				// this should always pass because of our limited player size
				...Result.getMessage(getRandomPlayerTile(playerTiles)),
				player
			})),
			points: 0
		});
	});

	return {
		...board,
		players,
		playerTiles
	};
}

function isValidTile(tile) {
	// ensure tile is one of the predefined types
	const { letterPoints, wordPoints, letter, startTile } = tile;
	if (
		!letter ||
		(typeof letter === "string" && letter.match(/^[a-z ]$/gm) === null)
	) {
		return false;
	}

	return tileTypes.some(
		type =>
			type.letterPoints === letterPoints &&
			type.wordPoints === wordPoints &&
			type.startTile === startTile
	);
}

function getAllBoardWords({ tiles }) {
	// we use recurision in a tree type higherarchy.

	const horizontalWords = tiles.reduce((acc, row, j) => {
		let curWord = [];
		const res = row.reduce((a, tile, i) => {
			const { letter } = tile;
			if (letter === "") {
				if (curWord.length > 0) {
					a.push(curWord);
				}
				curWord = [];
			} else {
				curWord.push({ ...tile, i, j });
			}
			return a;
		}, []);
		return acc.concat(res);
	}, []);

	const curWords = [
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	];
	const verticalWords = tiles.reduce((acc, row, j) => {
		const res = row.reduce((a, tile, i) => {
			const { letter } = tile;
			if (letter === "") {
				if (curWords[i].length > 0) {
					a.push(curWords[i]);
				}
				curWords[i] = [];
			} else {
				curWords[i].push({ ...tile, i, j });
			}
			return a;
		}, []);
		return acc.concat(res);
	}, []);

	// word lists contain single letter words that are actually part of another word.
	const sanitizedHorizontalWords = horizontalWords.reduce((acc, word) => {
		const text = word.map(({ letter }) => letter).join("");

		// if the word is a single tile, and not a valid word
		// and not in the other list, then this is a corrupted board.
		if (!validWord(text)) {
			console.log("Parsing invalid word: ", text);
			if (
				!text.length === 1 ||
				!verticalWords.find(
					({ i, j }) => word[0].i === i && word[0].j === j
				)
			) {
				Result.createError(`invalid word at ${tile.i}, ${tile.j}`);
			}
		} else {
			acc.push(word);
		}
		return acc;
	}, []);

	const sanitizedVerticalWords = verticalWords.reduce((acc, word) => {
		const text = word.map(({ letter }) => letter).join("");

		// if the word is a single tile, and not a valid word
		// and not in the other list, then this is a corrupted board.
		if (!validWord(text)) {
			console.log("Parsing invalid word: ", text);
			if (
				!text.length === 1 ||
				!horizontalWords.find(
					({ i, j }) => word[0].i === i && word[0].j === j
				)
			) {
				Result.createError(`invalid word at ${tile.i}, ${tile.j}`);
			}
		} else {
			acc.push(word);
		}
		return acc;
	}, []);

	return Result.create(
		sanitizedHorizontalWords.concat(sanitizedVerticalWords)
	);
}

// returns { [player]: { name: player, points: # } };
function getPointsFromWords(words) {
	return words.reduce((acc, word) => {
		const wordScore = word.reduce((a, tile) => {
			const player = tile.playerTile.player;
			if (!a[player]) {
				a = {
					...a,
					[player]: {
						points: 0,
						multiplier: 1
					}
				};
			}
			a[player].points += tile.playerTile.points * tile.letterPoints;
			a[player].multiplier *= tile.wordPoints;
			return a;
		}, {});
		return (playerScores = _.reduce(
			wordScore,
			(a, { points, multiplier }, player) => ({
				[player]: {
					name: player,
					points:
						((a[player] && a[player].points) || 0) +
						points * multiplier
				}
			}),
			acc
		));
	}, {});
}

function countPlayerTiles({ players = [], tiles = [], playerTiles = [] }) {
	const defaultPlayerTiles = getNewPlayerTiles();

	const tilesRes = tiles.reduce(
		(acc, row) =>
			row.reduce((a, tile) => {
				if (tile.playerTile) {
					const found = defaultPlayerTiles.findIndex(
						t => t.letter === tile.letter
					);
					if (found === -1) {
						return Result.createError(
							`There is an extra player tile with the letter '${
								tile.playerTile.letter
							}' on the Board.`
						);
					}
					defaultPlayerTiles.splice(found, 1);
				}
				return a;
			}, Result.create("No error")),
		Result.create("No error")
	);

	const playerTilesRes = playerTiles.reduce((acc, tile) => {
		const found = defaultPlayerTiles.findIndex(
			t => t.letter === tile.letter
		);

		if (found === -1) {
			return Result.createError(
				`There is an extra player tile with the letter '${
					tile.letter
				}' in playerTiles.`
			);
		}
		defaultPlayerTiles.splice(found, 1);
		return acc;
	}, Result.create("No error"));

	const playersRes = players.reduce(
		(acc, p) =>
			(p.tiles || []).reduce((a, tile) => {
				const found = defaultPlayerTiles.findIndex(
					t => t.letter === tile.letter
				);
				if (found === -1) {
					return Result.createError(
						`There is an extra player tile with the letter '${
							tile.letter
						}' in players.`
					);
				}
				defaultPlayerTiles.splice(found, 1);
				return a;
			}, Result.create("No error")),
		Result.create("No error")
	);

	if (defaultPlayerTiles.length > 0) {
		return Result.createError(
			`There are ${
				defaultPlayerTiles.length
			} player tiles not accounted for in this board.`
		);
	}
	return Result.create("All tiles accounted for.");
}

// TODO: Actually validate it
function isValidBoard(board) {
	// check players
	const { players, tiles, playerTiles } = board;
	if (!players || !Array.isArray(players)) {
		return Result.createError("Board requires players to be an array.");
		// ensure no duplicates
	} else if (
		players.length !== [...new Set(players.map(({ name }) => name))].length
	) {
		return Result.createError(
			"Board requires the players contain no duplicate names"
		);
	}

	// ensure all tiles are in the correct locations
	const defaultTiles = newBoard().tiles;
	defaultTiles.every((row, i) =>
		row.every((t, j) => {
			const { startTile: st, letterPoints: lp, wordPoints: wp } = t;
			const { startTile, letterPoints, wordPoints } = tiles[i][j];
			return (
				isValidTile(tiles[i][j]) &&
				startTile === st &&
				letterPoints === lp &&
				wp === wp
			);
		})
	);

	// ensure all player tiles accounted for
	const tileCountRes = countPlayerTiles({ players, tiles, playerTiles });
	if (Result.isError(tileCountRes)) {
		return tileCountRes;
	}

	// ensure all tiles are connected to the start tile

	// ensure all words are valid words and connect to the start tile
	const wordsRes = getAllBoardWords(board);
	if (Result.isError(wordsRes)) {
		return wordsRes;
	}

	// esnure all points match up
	const points = getPointsFromWords(Result.getMessage(wordsRes));
	if (
		!players.every(
			p =>
				points[p.name]
					? points[p.name].points === p.points
					: p.points === 0 || !p.points
		)
	) {
		return Result.createError("Points are not correct.");
	}

	return Result.create("Valid board.");
}

function getPlayers(board) {
	return board.players.map(({ name }) => name);
}

function isValidMove({
	board = {},
	player = "",
	word = "",
	row = -1,
	column = -1,
	right = false,
	down = false
}) {
	const boardRes = isValidBoard(board);
	if (Result.isError(boardRes)) {
		return boardRes;
	}
	const newBoardRes = move({
		board: cloneBoard(board),
		player,
		word,
		row,
		column,
		right,
		down
	});
	if (Result.isError(newBoardRes)) {
		return newBoardRes;
	}
	return Result.create("Valid move.");
}

function move({
	board = {},
	player = "",
	word = "",
	row = -1,
	column = -1,
	right = false,
	down = false
}) {
	const { tiles = [], players = [], turnCount = 0, playerTiles } = board;

	const turnPlayer = players[turnCount % players.length] || {};
	const {
		name: turnPlayerName = "",
		tiles: turnPlayerTiles = []
	} = turnPlayer;
	if (
		!turnPlayerName ||
		!player ||
		turnPlayerName.toLowerCase() !== player.toLowerCase()
	) {
		return Result.createError(
			`It is not ${player}'s turn. It is ${turnPlayerName}'s turn.`
		);
	}

	// ensure valid word
	if (!validWord(word)) {
		return Result.createError("Word provided is not in the dictionary.");
	}

	// ensure word can fit
	// +1 because length + location = tile after insert
	if (right) {
		if (word.length + column > 15) {
			return Result.createError("Word can not fit here.");
		}
	} else if (down) {
		if (word.length + row > 15) {
			return Result.createError("Word can not fit here.");
		}
	} else {
		return Result.createError("Must choose Right OR Down.");
	}

	const tilesUsed = [];
	// ensure word can be made from player tiles
	const canMakeWord =
		word.length > 0 &&
		_.reduce(
			word,
			(acc, letter) => {
				if (!acc) {
					return false;
				}
				const findIndex = turnPlayerTiles.findIndex(
					({ letter: l }) => l.toUpperCase() === letter.toUpperCase()
				);
				if (findIndex < 0) {
					return false;
				}
				const tile = turnPlayerTiles.splice(findIndex, 1)[0];
				if (!tile) {
					return false;
				}
				tilesUsed.push(tile);
				return acc;
			},
			true
		);
	if (!canMakeWord) {
		return Result.createError(`Can not make '${word}' with current tiles.`);
	}

	// attempt add word to board
	if (right) {
		for (let i = column; i < word.length + column; i++) {
			if (tiles[row][i].letter !== "") {
				return Result.createError("Can not replace tiles.");
			}
			const tileUsed = tilesUsed[i - column];
			const { letter } = tileUsed;
			tiles[row][i].letter = letter;
			tiles[row][i].playerTile = tileUsed;
		}
	} else {
		for (let i = row; i < word.length + row; i++) {
			if (tiles[i][column].letter !== "") {
				return Result.createError("Can not replace tiles.");
			}
			const tileUsed = tilesUsed[i - row];
			const { letter } = tileUsed;
			tiles[i][column].letter = letter;
			tiles[i][column].playerTile = tileUsed;
		}
	} // we already validated right XOR down

	// ensure words are valid
	const wordsRes = getAllBoardWords(board);
	if (Result.isError(wordsRes)) {
		return wordsRes;
	}

	// points
	const points = getPointsFromWords(Result.getMessage(wordsRes));
	const updatedPlayers = players.map(p => ({
		...p,
		points: (points[p.name] && points[p.name].points) || 0
	}));

	// now add new tiles to current player
	while (players[turnCount % players.length].tiles.length < 7) {
		const randTileRes = getRandomPlayerTile(playerTiles);
		if (Result.isError(randTileRes)) {
			// WE FOUND A WINNER
			const newBoard = {
				...board,
				winner: updatedPlayers.reduce((acc, player) => {
					if (acc.points < player.points) {
						return player;
					}
				}),
				turnCount: ++board.turnCount
			};
			if (Result.isError(newBoardRes)) {
				return newBoardRes;
			}
			return Result.create(newBoard);
		}
		players[turnCount % players.length].tiles.push(
			Result.getMessage(randTileRes)
		);
	}

	const newBoard = {
		...board,
		players: updatedPlayers,
		turnCount: ++board.turnCount
	};

	const newBoardRes = isValidBoard(newBoard);
	if (Result.isError(newBoardRes)) {
		return newBoardRes;
	}

	return Result.create(newBoard);
}

module.exports = {
	newBoard,
	isValidTile,
	isValidBoard,
	cloneBoard,
	addPlayersToBoard,
	getPlayers,
	isValidMove,
	move
};
