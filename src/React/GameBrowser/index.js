import React from 'react';
import Styled from 'styled-components';

import Table from '../Table';

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
					<Table>
					</Table>
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				{userGames}
				<TitleWrapper>
					All Games
				</TitleWrapper>
				<Table>
				</Table>
			</React.Fragment>
		);
	}
}

export default GameBrowser;