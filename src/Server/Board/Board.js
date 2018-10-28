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

export function newBoard() {
	return {};
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
