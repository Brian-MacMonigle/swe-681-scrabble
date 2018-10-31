import React from "react";
import styled from "styled-components";
import { getJSONFromServer } from "../FetchWrapper";

const START = "start";
const DOUBLE_LETTER = "double-letter";
const TRIPLE_LETTER = "triple-letter";
const DOUBLE_WORD = "double-word";
const TRIPLE_WORD = "triple-word";

// 45 + 3 for border
const TILE_SIZE = 47;
const BOARD_SIZE = 15;

function isStartTile(tile) {
	return tile.startTile;
}

function isDoubleLetter(tile) {
	return tile.letterPoints === 2;
}

function isTripleLetter(tile) {
	return tile.letterPoints === 3;
}

function isDoubleWord(tile) {
	return tile.wordPoints === 2;
}

function isTripleWord(tile) {
	return tile.wordPoints === 3;
}

function tileType(tile) {
	if (isStartTile(tile)) {
		return START;
	}
	if (isDoubleLetter(tile)) {
		return DOUBLE_LETTER;
	}
	if (isTripleLetter(tile)) {
		return TRIPLE_LETTER;
	}
	if (isDoubleWord(tile)) {
		return DOUBLE_WORD;
	}
	if (isTripleWord(tile)) {
		return TRIPLE_WORD;
	}
	return undefined;
}

function tileTypeToString(type) {
	const map = {
		[START]: "START",
		[DOUBLE_LETTER]: "DOUBLE LETTER SCORE",
		[TRIPLE_LETTER]: "TRIPLE LETTER SCORE",
		[DOUBLE_WORD]: "DOUBLE WORD SCORE",
		[TRIPLE_WORD]: "TRIPLE WORD SCORE"
	};
	return map[type];
}

function backgroundColorByTile(type) {
	const map = {
		[START]: "red",
		[DOUBLE_LETTER]: "cyan",
		[TRIPLE_LETTER]: "blue",
		[DOUBLE_WORD]: "pink",
		[TRIPLE_WORD]: "orange"
	};
	return map[type];
}

const TileWrapper = styled.span`
	border: 1px solid black;
	width: ${TILE_SIZE}px;
	height: ${TILE_SIZE}px;
	display: inline-block;
	background-color: ${props => backgroundColorByTile(props.type)};
`;

const RowWrapper = styled.div`
	margin: 0;
	padding: 0;
	display: flex;
	width: ${BOARD_SIZE * TILE_SIZE}px;
	height: ${TILE_SIZE}px;
`;

const BoardWrapper = styled.div`
	border: 1px solid black;
	width: ${BOARD_SIZE * TILE_SIZE}px;
	height: ${BOARD_SIZE * TILE_SIZE}px;
`;

const TileTypeWrapper = styled.div`
	position: relative;
	float: left;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
	font-size: 10px;
`;

const Tile = ({
	tile,
	onTileClick = () => {},
	coordinates = { row: -1, col: -1 }
}) => {
	const type = tileType(tile);
	const onClick = typeof onTileClick === "function" && onTileClick;
	return (
		<TileWrapper type={type} onClick={event => onClick(coordinates)}>
			<TileTypeWrapper>{tileTypeToString(type)}</TileTypeWrapper>
			{tile.letter}
		</TileWrapper>
	);
};

const Row = ({ row = [], onTileClick, rowNumber }) => (
	<RowWrapper>
		{row &&
			row.map((tile, j) => (
				<Tile
					key={`Board-Row-Tile-${j}`}
					tile={tile}
					coordinates={{ row: rowNumber, col: j }}
					onTileClick={onTileClick}
				/>
			))}
	</RowWrapper>
);

const Board = ({ tiles = [], onTileClick }) => (
	<BoardWrapper>
		{tiles &&
			tiles.map((row, i) => (
				<Row
					key={`Board-Row-${i}`}
					row={row}
					rowNumber={i}
					onTileClick={onTileClick}
				/>
			))}
	</BoardWrapper>
);

class FetchedBoard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			board: []
		};
	}

	componentDidMount() {
		getJSONFromServer("/board/new")
			.then(data => {
				this.setState({ board: data.tiles });
			})
			.catch(err => {
				this.setState({ board: err });
			});
	}

	render() {
		const onClick = ({ row, col }) => alert(`row: ${row}\ncolumn: ${col}`);
		return <Board tiles={this.state.board} onTileClick={onClick} />;
	}
}

export default Board;
export { FetchedBoard };
