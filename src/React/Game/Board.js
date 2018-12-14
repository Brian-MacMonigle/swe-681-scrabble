import React from "react";
import Styled from "styled-components";
import uuid from "uuid/v4";

import Result, { postJSONFromServer } from "../FetchWrapper";

const DEFAULT_TILE_COLOR = "Cornsilk";

const Error = Styled.div`
	color: red;
	text-align: center;
`;

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

const CELL_SIZE = 45;

const Cell = Styled.td`
	background: ${props => props.color || DEFAULT_TILE_COLOR};
	border: ${props => (props.selected && "3px") || "1px"} solid #555;
	width: ${CELL_SIZE}px;
	height: ${CELL_SIZE}px;
	line-height: ${CELL_SIZE}px;
	text-align: center;
`;

const PlayerTile = Styled.div`
	background: ${DEFAULT_TILE_COLOR};
	border: 1px solid #555;
	width: ${CELL_SIZE}px;
	height: ${CELL_SIZE}px;
	line-height: ${CELL_SIZE}px;
	text-align: center;
`;

const PlayerInput = Styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const PlayerInputRow = Styled.div`
	padding: 1em;
`;

const PlayerInputText = Styled.span`
	margin: 1em;
`;

const InputWrapper = Styled.input`
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
	constructor(props) {
		super(props);

		this.state = {
			tile: {
				row: null,
				column: null
			},
			word: "",
			radio: {
				right: true
			},
			error: null
		};
	}

	onSelectTile = (i, j) => {
		this.setState({
			tile: {
				row: i,
				column: j
			}
		});
	};

	onType = event => {
		this.setState({
			word: event.target.value
		});
	};

	onRadio = event => {
		this.setState({
			radio: {
				[event.target.name]: event.target.value === "on" ? true : false
			}
		});
	};

	onMove = async () => {
		const {
			props: { loginState: { username = "" } = {}, refetch, id },
			state: {
				word,
				tile: { row, column },
				radio: { right = false, down = false } = {}
			}
		} = this;

		console.log(
			"onMove: ",
			"\nusername: ",
			username,
			"\nword: ",
			word,
			"\nselectedTile: ",
			"\n\trow: ",
			row,
			"\n\tcolumn: ",
			column,
			"\nright: ",
			right,
			"\ndown: ",
			down
		);

		const res = await postJSONFromServer("/games/move", {
			username,
			word,
			row,
			column,
			right,
			down,
			id
		});

		if (Result.isError(res)) {
			this.setState({
				error: Result.getMessage(res)
			});
		} else {
			this.setState({
				error: null
			});
			refetch();
		}
	};

	renderCell = (tile, i, j) => {
		const { state: { tile: { row, column } = {} } = {} } = this;
		let { letter = "" } = tile;
		if (letter === " ") {
			letter = '" "';
		}

		return (
			<Cell
				key={uuid()}
				color={getColor(tile)}
				selected={i === row && j === column}
				onClick={() => this.onSelectTile(i, j)}
			>
				{letter}
			</Cell>
		);
	};

	render() {
		const {
			props: {
				loginState: { username = "" } = {},
				gameData,
				gameData: {
					gameName = "",
					winner = null,
					board: { tiles = [], players = [], turnCount } = {}
				} = {}
			} = {},
			state: {
				word,
				tile: selectedTile,
				radio: { right = false, down = false } = {}
			}
		} = this;
		let {
			state: { error }
		} = this;

		const turnPlayer = players[turnCount % players.length] || {};
		const { name: turnPlayerName = "" } = turnPlayer;

		const thisPlayer =
			players.find(
				({ name = "" }) => name.toLowerCase() === username.toLowerCase()
			) || {};
		const {
			name: playerName = "",
			tiles: playerTiles = [],
			points: playerPoints = 0
		} = thisPlayer;

		const opponent =
			players.filter(
				({ name = "" }) => name.toLowerCase() !== username.toLowerCase()
			)[0] || {};
		const {
			name: opponentName = "NO OPPONENT YET",
			tiles: opponentTiles = [],
			points: opponentPoints = 0
		} = opponent;

		console.log(
			"ScrabbleBoard: ",
			"\nrender: ",
			this,
			"\nerror: ",
			error,
			"\ngameData: ",
			gameData,
			"\ngameName: ",
			gameName,
			"\nturnCount: ",
			turnCount,
			"\nturnPlayer: ",
			turnPlayer,
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
			playerTiles,
			"\nright: ",
			right,
			"\ndown: ",
			down,
			"\nselectedTile: ",
			selectedTile
		);

		if (players.length < 2) {
			error = "Please invite someone else to your game.";
		}

		if (!gameData) {
			error = "Error drawing board. Please try again.";
		}

		if (!thisPlayer) {
			error =
				"You are attempting to view a board that you are not a player of.  Please join the game first via the GameBrowser.";
		}

		return (
			<React.Fragment>
				{error && <Error>{error}</Error>}
				<Title>{gameName}</Title>
				{winner ? (
					<Title>The winner is {winner}!</Title>
				) : (
					<Title>
						{turnPlayerName}
						's Turn
					</Title>
				)}
				<SmallTitle>
					Your Points: {playerPoints}. {opponentName}
					's Points: {opponentPoints}.
				</SmallTitle>
				<Table>
					<TBody>
						{tiles.map((row, i) => (
							<TR key={uuid()}>
								{(row || []).map((tile, j) =>
									this.renderCell(tile, i, j)
								)}
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
				<PlayerInput>
					<PlayerInputRow>
						<PlayerInputText>
							First please select the tile you wish to add your
							word at
						</PlayerInputText>
					</PlayerInputRow>
					<PlayerInputRow>
						<PlayerInputText>
							Please enter the word you wish to play
						</PlayerInputText>
						<InputWrapper
							type="text"
							value={word}
							onChange={this.onType}
						/>
					</PlayerInputRow>
					<PlayerInputRow>
						<PlayerInputText>
							*If you are using a " " tile, please enter that
							space in the box. Ex: WO D is equal to WORD using a
							" " for R
						</PlayerInputText>
					</PlayerInputRow>
					<PlayerInputRow>
						<PlayerInputText>
							Please select the direction of your word:
						</PlayerInputText>
						<PlayerInputText>Right</PlayerInputText>
						<InputWrapper
							type="radio"
							name="right"
							checked={right}
							onChange={this.onRadio}
						/>
						<PlayerInputText>Down</PlayerInputText>
						<InputWrapper
							type="radio"
							name="down"
							checked={down}
							onChange={this.onRadio}
						/>
					</PlayerInputRow>
					<PlayerInputRow>
						<InputWrapper
							type="button"
							value="Play Move"
							onClick={this.onMove}
						/>
					</PlayerInputRow>
				</PlayerInput>
				<SmallTitle>
					{opponentName}
					's Tiles:
				</SmallTitle>
				<PlayerTiles>
					{opponentTiles.map(tile => (
						<PlayerTile key={uuid()}>{tile.letter}</PlayerTile>
					))}
				</PlayerTiles>
			</React.Fragment>
		);
	}
}

export default ScrabbleBoard;
