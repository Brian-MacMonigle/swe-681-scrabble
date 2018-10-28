import * as Board from './Board';

describe('Board', () => {
	let newBoard;
	beforeAll(() => {
		console.log(Board);
		newBoard = Board.newBoard();
	});

	describe('newBoard()', () => {
		it('matches snapshot', () => {
			expect(newBoard).toMatchSnapshot();
		});
	});
});