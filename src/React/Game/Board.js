import React from "react";
import Styled from "styled-components";

const Title = Styled.h1`
	text-align: center;
`;

const SmallTitle = Styled.h2``;

const PlayerTiles = Styled.div`
	display: flex;
`;

const Table = Styled.table``;

const TBody = Styled.tbody``;

const TR = Styled.tr``;

const Cell = Styled.td`
	background: ${props => props.color || "Cornsilk"};
	border: 1px solid #555;
	width: 50px;
	height: 50px;
	lineHeight: 50px;
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

		return <Cell color={getColor(tile)}>{letter}</Cell>;
	};

	shouldComponentUpdate(nextProps, nextState) {
		console.log("nextProps: ", nextProps);
	}

	render() {
		const {
			props: {
				logginState: { username } = {},
				gameData,
				gameData: {
					gameName = "",
					board: { tiles = [], players = [] } = {}
				} = {}
			} = {}
		} = this;

		const thisPlayer = players.find(({ name }) => name === username);

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
			thisPlayer
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
							<TR>
								{(row || []).map(tile => this.renderCell(tile))}
							</TR>
						))}
					</TBody>
				</Table>
				<SmallTitle>Your Tiles:</SmallTitle>
				<PlayerTiles>{thisPlayer}</PlayerTiles>
			</React.Fragment>
		);
	}
}

export default ScrabbleBoard;
