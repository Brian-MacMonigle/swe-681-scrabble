import * as Board from "./Board";

describe("Board", () => {
	let newBoard;
	beforeAll(() => {
		newBoard = Board.newBoard();
	});

	describe("newBoard()", () => {
		it("matches snapshot", () => {
			expect(newBoard).toMatchSnapshot();
		});

		it("has 15 rows", () => {
			expect(newBoard.tiles.length).toEqual(15);
		});

		it("has 15 columns", () => {
			newBoard.tiles.forEach(row => expect(row.length).toEqual(15));
		});
	});

	describe("isValidTile()", () => {
		it("matches normal tile", () => {
			const tile = {
				letterPoints: 1,
				wordPoints: 1,
				letter: " ",
				startTile: false
			};
			expect(Board.isValidTile(tile)).toEqual(true);
		});

		it("succeeds for adding a key", () => {
			const badTile = {
				letterPoints: 1,
				wordPoints: 1,
				letter: " ",
				startTile: false,
				somethingExtra: "should cause function to fail"
			};
			expect(Board.isValidTile(badTile)).toEqual(true);
		});

		it("fails for removing a key", () => {
			const badTile = {
				letterPoints: 1,
				wordPoints: 1,
				letter: " "
			};
			expect(Board.isValidTile(badTile)).toEqual(false);
		});

		it("fails for making a required key undefined", () => {
			const badTile = {
				letterPoints: 1,
				wordPoints: 1,
				startTile: false
			};
			expect(Board.isValidTile(badTile)).toEqual(false);
		});

		it("fails for invalid (non-alpha or space) letter", () => {
			const badTile = {
				letterPoints: 1,
				wordPoints: 1,
				letter: "1",
				startTile: false
			};
			expect(Board.isValidTile(badTile)).toEqual(false);
		});

		it("fails for modifying a valid tile", () => {
			const badTile = {
				letterPoints: 3,
				wordPoints: 3,
				letter: " ",
				startTile: false
			};
			expect(Board.isValidTile(badTile)).toEqual(false);
		});
	});
});
