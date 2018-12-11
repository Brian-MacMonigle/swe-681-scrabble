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
		accessor: 'name',
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
		accessor: 'button',
		css: {
			'text-align': 'center',
		}
	},
]

const userGameHeaders = [
	{
		Header: "Game Name",
		accessor: 'name',
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
		Header: "Delete Game",
		accessor: 'button',
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
		}
	}

	parseData = (data, isUser) => {
		return data && map(data, (game) => ({
			...game,
			button: (
				<button 
					onClick={() => isUser ? this.onHost() : this.onJoin(game.id)}
				>
					{isUser ? 'Delete' : 'Join'}
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

	async componentDidMount() {
		const res = await getJSONFromServer('/games/all');
		if(Result.isSuccess(res)) {
			this.setState({
				data: this.parseData(Result.getMessage(res)),
			})
		}
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
						data={[]}
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