const tile = {
	letterPoints: 1,
	wordPoints: 1,
	letter: " ",
	startTile: false
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

export function newBoard() {
	return JSON.parse(
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
			]
		})
	);
}

export function isValidTile(tile) {
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
