import React from "react";

import queryToPropsHOC from "../queryToPropsHOC";
import { postJSONFromServer } from "../FetchWrapper";

// import Board from "./Board";

class GameWrapper extends React.Component {
	constructor(props) {
		super(props);

		this.updateBoard();
	}

	updateBoard = async () => {
		const { props: { id } = {} } = this;
		const res = await postJSONFromServer("/games/board", { id });
		console.log("Board: ", res);
	};

	render() {
		return <p>I am the Game Wrapper</p>;
	}
}

export default queryToPropsHOC(GameWrapper);
