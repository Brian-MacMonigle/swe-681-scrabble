import React from "react";
import Styled from "styled-components";
import uuid from "uuid/v4";

const DEFAULT_TILE_COLOR = "Cornsilk";

const Title = Styled.h1`
	text-align: center;
`;

const SmallTitle = Styled.h2`
	text-align: center;
`;

const PlayerTiles = Styled.div`
	display: flex;
	justify-content: center;
`;

const Table = Styled.table`
	margin: auto;
`;

const TBody = Styled.tbody``;

const TR = Styled.tr``;

const Cell = Styled.td`
	background: ${props => props.color || DEFAULT_TILE_COLOR};
	border: 1px solid #555;
	width: 40px;
	height: 40px;
	lineHeight: 40px;
	text-align: center;
`;

const PlayerTile = Styled.div`
	background: ${DEFAULT_TILE_COLOR};
	border: 1px solid #555;
	width: 40px;
	height: 40px;
	lineHeight: 40px;
	text-align: center;
`;

function getColor({ letterPoints, wordPoints, startTile }) {
	if (startTile || wordPoints === 2) {
		return "Pink";
	}
	if (wordPoints === 3) {
		return "HotPink";
	}
	if (letterPoints === 2) {
		return "PaleTurquoise";
	}
	if (letterPoints === 3) {
		return "Turquoise";
	}
	return "Cornsilk";
}

class ScrabbleBoard extends React.Component {
	renderCell = tile => {
		const { letter = " " } = tile;

		return (
			<Cell key={uuid()} color={getColor(tile)}>
				{letter}
			</Cell>
		);
	};

	shouldComponentUpdate(nextProps, nextState) {
		console.log("nextProps: ", nextProps);
	}

	render() {
		const {
			props: {
				loginState: { username } = {},
				gameData,
				gameData: {
					gameName = "",
					board: { tiles = [], players = [] } = {}
				} = {}
			} = {}
		} = this;

		const thisPlayer = players.find(({ name }) => name === username) || {};
		const { name: playerName = "", tiles: playerTiles = [] } = thisPlayer;
		console.log(
			"ScrabbleBoard: ",
			"\nrender: ",
			this,
			"\ngameData: ",
			gameData,
			"\ngameName: ",
			gameName,
			"\ntiles: ",
			tiles,
			"\nplayers: ",
			players,
			"\nusername: ",
			username,
			"\nthisPlayer: ",
			thisPlayer,
			"\nplayerName: ",
			playerName,
			"\nplayerTiles: ",
			playerTiles
		);

		if (!thisPlayer) {
			return (
				<p>
					You are attempting to view a board that you are not a player
					of
				</p>
			);
		}

		if (!gameData) {
			return <p>Error drawing board. Please try again.</p>;
		}

		return (
			<React.Fragment>
				<Title>{gameName}</Title>
				<Table>
					<TBody>
						{tiles.map(row => (
							<TR key={uuid()}>
								{(row || []).map(tile => this.renderCell(tile))}
							</TR>
						))}
					</TBody>
				</Table>
				<SmallTitle>Your Tiles:</SmallTitle>
				<PlayerTiles>
					{playerTiles.map(tile => (
						<PlayerTile key={uuid()}>{tile.letter}</PlayerTile>
					))}
				</PlayerTiles>
			</React.Fragment>
		);
	}
}

export default ScrabbleBoard;
