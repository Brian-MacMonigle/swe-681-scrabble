import React from 'react';
import { withRouter } from 'react-router';
import Styled from 'styled-components';
import { map } from 'lodash';

import Result, { getJSONFromServer } from '../FetchWrapper';
import * as ROUTES from '../Constants/Routes';
import Table from '../Table';

const allGameHeaders = [
	{
		Header: "Game Name",
		accessor: 'gameName',
	},
	{
		Header: "Host",
		accessor: 'host',
	},
	{
		Header: "Players",
		accessor: (cell) => `${cell.players}/2`,
	},
	{
		Header: "Join Game",
		accessor: 'join',
		css: {
			'text-align': 'center',
		}
	},
]

const userGameHeaders = [
	...allGameHeaders,
	{
		Header: "Delete Game",
		accessor: 'delete',
		css: {
			'text-align': 'center',
		}
	},
]

const TitleWrapper = Styled.h1`
`;

class GameBrowser extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			userData: [],
		}
	}

	parseData = (data, isUser) => {
		return data && map(data, (game) => ({
			...game,
			join: (
					<button
						onClick={() => this.onJoin(game.id)}
					>
						Join
					</button>
				),
			delete: (
					<button
						onClick={() => this.onDelete(game.id)}
					>
						Delete
					</button>
				)
		})) || [];
	}

	onHost = () => {
		const {
			props: {
				history,
			} = {},
		} = this;
		if(history) {
			history.push(ROUTES.HOST);
		}
	}

	onJoin = (id) => {
		alert(`Clicked join game #${id}`)
	}

	onDelete = (id) => {
		const {
			props: {
				loginState: {
					username,
				} = {},
			} = {},
		} = this;
		if(!username) {
			alert('I am sorry, but I can\'t let you do that.');
			return;
		}
		alert(`Clicked delete game #${id}`);
	}

	componentDidMount() {
		getJSONFromServer('/games/all')
			.then(res => {
				if(Result.isSuccess(res)) {
					this.setState({
						data: this.parseData(Result.getMessage(res)),
					})
				}
			});
		getJSONFromServer('/games/user')
			.then(res => {
				if(Result.isSuccess(res)) {
					this.setState({
						userData: this.parseData(Result.getMessage(res), true),
					})
				}
			});
	}

	render() {
		const {
			props: {
				loginState: {
					username,
				} = {},
			} = {},
			state: {
				data,
				userData,
			},
		} = this;
		let userGames = null;
		if(username) {
			userGames = (
				<React.Fragment>
					<TitleWrapper>
						<button onClick={this.onHost}>
							Host Game
						</button>
					</TitleWrapper>
					<TitleWrapper>
						Current Games
					</TitleWrapper>
					<Table
						headers={userGameHeaders}
						data={userData}
					/>
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				{userGames}
				<TitleWrapper>
					All Games
				</TitleWrapper>
				<Table
					headers={allGameHeaders}
					data={data}
				/>
			</React.Fragment>
		);
	}
}

export default withRouter(GameBrowser);