import React from "react";

import Result from "../FetchWrapper";
import queryToPropsHOC from "../queryToPropsHOC";
import { postJSONFromServer } from "../FetchWrapper";

import Board from "./Board";

class GameWrapper extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			gameData: null,
			error: "The board hasn't loaded yet"
		};

		this.updateBoard();
	}

	updateBoard = async () => {
		const { props: { id } = {} } = this;
		const res = await postJSONFromServer("/games/board", { id });
		if (Result.isError(res)) {
			this.setState({
				error: Result.getMessage(res)
			});
		}
		this.setState({
			gameData: Result.getMessage(res),
			error: null
		});
	};

	render() {
		const {
			state: { gameData, error } = {},
			props: { loginState } = {}
		} = this;
		if (error) {
			return <p>{error}</p>;
		}
		return <Board loginState={loginState} gameData={gameData} />;
	}
}

export default queryToPropsHOC(GameWrapper);
