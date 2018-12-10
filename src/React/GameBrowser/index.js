import React from 'react';
import Styled from 'styled-components';

const TitleWrapper = Styled.h1`
`;

const TableWrapper = Styled.div`
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
				<TitleWrapper>
					Current Games
				</TitleWrapper>
			);
		}

		return (
			<React.Fragment>
				{userGames}
				<TitleWrapper>
					All Games
				</TitleWrapper>
				<TableWrapper>

				</TableWrapper>
			</React.Fragment>
		);
	}
}

export default GameBrowser;