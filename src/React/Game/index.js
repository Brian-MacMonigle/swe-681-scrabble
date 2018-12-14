import React from "react";
import Styled from "styled-components";

import Result from "../FetchWrapper";
import queryToPropsHOC from "../queryToPropsHOC";
import { postJSONFromServer } from "../FetchWrapper";

import Board from "./Board";

const Error = Styled.div`
	color: red;
	text-align: center;
`;

class GameFetcher extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			gameData: null,
			error: "The board hasn't loaded yet"
		};

		this.updateBoard();
	}

	componentDidMount() {
		this.timer = setInterval(() => this.updateBoard(), 1000 * 5);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	updateBoard = async () => {
		const { props: { id, loginState: { username } } = {} } = this;
		if (!id) {
			return;
		}
		if (!username) {
			this.setState({
				error:
					"You need to be logged in to view the contents of this page."
			});
			return;
		}
		const res = await postJSONFromServer("/games/board", { id });
		if (Result.isError(res)) {
			this.setState({
				error: Result.getMessage(res)
			});
		} else {
			this.setState({
				gameData: Result.getMessage(res),
				error: null
			});
		}
	};

	componentDidUpdate(prevProps) {
		const { props: { loginState: { username } = {} } = {} } = this;
		const { loginState: { username: prevUsername } = {} } = prevProps;
		if (username !== prevUsername) {
			this.updateBoard();
		}
	}

	render() {
		const {
			state: { gameData, error } = {},
			props: { loginState, id } = {}
		} = this;
		if (error) {
			return <Error>{error}</Error>;
		}
		return (
			<Board
				loginState={loginState}
				gameData={gameData}
				id={id}
				refetch={this.updateBoard}
			/>
		);
	}
}

export default queryToPropsHOC(GameFetcher);
