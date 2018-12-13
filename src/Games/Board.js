const Random = require("random-js");
const random = new Random(Random.engines.browserCrypto);

const Result = require("../APICallResult");

const tile = {
	letterPoints: 1,
	wordPoints: 1,
	letter: " ",
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
	startTile: true
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
	const tileIndex = random.integer(0, allPlayerTiles.length);
	return allPlayerTiles.splice(tileIndex, 1)[0];
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
			turnIndex: 0,
			turnCount: 0
		})
	);
	if (players.length > 0) {
		board = addPlayersToBoard(board, players);
	}
	return board;
}

function cloneBoard(board) {
	return JSON.parse(JSON.stringify(board));
}

function addPlayersToBoard(board = {}, users = []) {
	const { players: oldPlayers, playerTiles } = cloneBoard(board);
	const players = oldPlayers;
	const tiles = [0, 0, 0, 0, 0, 0, 0].map(() =>
		getRandomPlayerTile(playerTiles)
	);
	users.forEach(player => {
		players.push({
			name: player,
			tiles
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

// TODO: Actually validate it
function isValidBoard(board) {
	return Result.create("NEED TO UPDATE THIS FUNCTION!!!");
}

function getPlayers(board) {
	return board.players.map(({ name }) => name);
}

module.exports = {
	newBoard,
	isValidTile,
	isValidBoard,
	cloneBoard,
	addPlayersToBoard,
	getPlayers
};
