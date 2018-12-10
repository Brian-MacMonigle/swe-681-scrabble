import React from 'react';
import Styled from 'styled-components';

import Table from '../Table';

const tableHeaders = [
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
		accessor: 'join',
	},
]

const fakeData = [
	{
		name: 'Brian\'s Game',
		host: 'Brian',
		players: 0,
		join: <button onClick={() => alert('heyyy')}>Join Game</button>
	}
]

const TitleWrapper = Styled.h1`
`;

class GameBrowser extends React.Component {
	render() {
		const {
			props: {
				loginState: {
					username,
				} = {},
			} = {},
		} = this;
		let userGames = null;
		if(username) {
			userGames = (
				<React.Fragment>
					<TitleWrapper>
						Current Games
					</TitleWrapper>
					<Table

					/>
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<TitleWrapper>
					<button>
						Host Game
					</button>
				</TitleWrapper>
				{userGames}
				<TitleWrapper>
					All Games
				</TitleWrapper>
				<Table
					headers={tableHeaders}
					data={fakeData}
					className="-striped -highlight"
				/>
			</React.Fragment>
		);
	}
}

export default GameBrowser;