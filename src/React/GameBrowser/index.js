import React from "react";
import { withRouter } from "react-router";
import Styled from "styled-components";
import { map } from "lodash";

import Result, { getJSONFromServer, postJSONFromServer } from "../FetchWrapper";
import * as ROUTES from "../Constants/Routes";
import Table from "../Table";

const allGameHeaders = [
	{
		Header: "Game Name",
		accessor: "gameName"
	},
	{
		Header: "Host",
		accessor: "host"
	},
	{
		Header: "Players",
		accessor: cell => `${(cell.players && cell.players.length) || -1}/2`
	},
	{
		Header: "Join Game",
		accessor: "join",
		css: {
			"text-align": "center"
		}
	}
];

const userGameHeaders = [
	...allGameHeaders,
	{
		Header: "Quit or Delete Game",
		accessor: "delete",
		css: {
			"text-align": "center"
		}
	}
];

const TitleWrapper = Styled.h1`
`;

class GameBrowser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			userData: []
		};
	}

	componentDidMount() {
		this.reloadData();
	}

	shouldComponentUpdate(nextProps) {
		// TODO: check if we need to fetch new games
		const { props: { loginState: { username } = {} } = {} } = this;
		const { loginState: { username: oldUsername } = {} } = nextProps;
		if (username !== oldUsername) {
			this.reloadData();
		}
		return true;
	}

	reloadData = () => {
		getJSONFromServer("/games/user").then(res => {
			if (Result.isSuccess(res)) {
				const { props: { loginState: { username } = {} } = {} } = this;
				this.setState({
					userData: this.parseData(Result.getMessage(res), username)
				});
			}
		});
		getJSONFromServer("/games/all").then(res => {
			if (Result.isSuccess(res)) {
				const { props: { loginState: { username } = {} } = {} } = this;
				this.setState({
					data: this.parseData(Result.getMessage(res), username)
				});
			}
		});
	};

	parseData = (data, username) => {
		return (
			(data &&
				map(data, game => ({
					...game,
					join: (
						<button
							onClick={() => this.onJoin(game.id)}
							disabled={game.host === username}
						>
							Join
						</button>
					),
					delete: (
						<button onClick={() => this.onDeleteOrQuit(game.id)}>
							{game.host === username ? "Delete" : "Quit"}
						</button>
					)
				}))) ||
			[]
		);
	};

	onHost = () => {
		const { props: { history } = {} } = this;
		if (history) {
			history.push(ROUTES.HOST);
		}
	};

	onJoin = async id => {
		const {
			props: { loginState: { username } = {} } = {},
			state: { data, userData }
		} = this;

		if (!username) {
			alert("Please Log In or Sign Up before joining a game.");
			return;
		}

		const game =
			userData.find(d => d.id === id) || data.find(d => d.id === id);
		if (!game) {
			console.error("Could not find game to delete.");
			return;
		}

		let res;
		// can't join own game
		if (game.host === username) {
			alert("You can not join your own game.");
			return;
		} else {
			// quit from game
			res = await postJSONFromServer("/games/join", { id });
		}
		if (Result.isSuccess(res)) {
			console.log("onJoin: ", "\nres: ", Result.getMessage(res));
			this.reloadData();
		} else {
			console.log("onJoin: ", "\nerror res: ", Result.getMessage(res));
		}
	};

	onDeleteOrQuit = async id => {
		const {
			props: { loginState: { username } = {} } = {},
			state: { userData } = {}
		} = this;

		if (!username) {
			alert("Please Log In or Sign Up before quitting a game.");
			return;
		}

		const game = userData.find(d => d.id === id);
		if (!game) {
			console.error("Could not find game to delete.");
			return;
		}

		let res;
		// delete own game
		if (game.host === username) {
			res = await postJSONFromServer("/games/delete", { id });
		} else {
			// quit from game
			res = await postJSONFromServer("/games/quit", { id });
		}
		if (Result.isSuccess(res)) {
			console.log("onDeleteOrQuit: ", "\nres: ", Result.getMessage(res));
			this.reloadData();
		} else {
			console.log(
				"onDeleteOrQuit: ",
				"\nerror res: ",
				Result.getMessage(res)
			);
		}
	};

	render() {
		const {
			props: { loginState: { username } = {} } = {},
			state: { data, userData }
		} = this;
		let userGames = null;
		if (username) {
			userGames = (
				<React.Fragment>
					<TitleWrapper>
						<button onClick={this.onHost}>Host Game</button>
					</TitleWrapper>
					<TitleWrapper>Current Games</TitleWrapper>
					<Table headers={userGameHeaders} data={userData} />
					<p>*Quitting will remove you from someone elses game</p>
					<p>*Deleting will remove the game permanently</p>
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				{userGames}
				<TitleWrapper>All Games</TitleWrapper>
				<Table headers={allGameHeaders} data={data} />
			</React.Fragment>
		);
	}
}

export default withRouter(GameBrowser);
