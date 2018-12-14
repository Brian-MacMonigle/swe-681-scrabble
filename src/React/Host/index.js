import React, { Component } from "react";
import { withRouter } from "react-router";
import Styled from "styled-components";

import Result, { postJSONFromServer } from "../FetchWrapper";

const Error = Styled.div`
	color: red;
	text-align: center;
`;

const HostTitle = Styled.h1`
`;

const FormInput = Styled.div`
	padding: 1em;
`;

const FormText = Styled.span`
	padding: 0.25em;
`;

class HostPage extends Component {
	constructor(props) {
		super(props);
		const {
			loginState: { username }
		} = props;

		this.state = {
			gameName: `${username}'s game`
		};
	}

	onType = event => {
		this.setState({ [event.target.name]: event.target.value });
	};

	onHost = async () => {
		const { state: { gameName } = {}, props: { history } = {} } = this;

		const res = await postJSONFromServer("/games/new", {
			gameName
		});
		if (Result.isSuccess(res)) {
			const { id } = Result.getMessage(res);
			history.push(`/game/?id=${id}`);
		}
	};

	render() {
		const {
			props: { loginState: { username } = {} } = {},
			state: { gameName } = {}
		} = this;

		if (!username) {
			return <Error>You must be logged in to host a game.</Error>;
		}

		return (
			<React.Fragment>
				<HostTitle>{`Host a game as ${username}:`}</HostTitle>
				<FormInput>
					<FormText>Game Name:</FormText>
					<input
						name="gameName"
						value={gameName}
						onChange={this.onType}
						type="text"
						placeholder={`${username}'s game`}
					/>
				</FormInput>
				<button onClick={this.onHost}>Host</button>
			</React.Fragment>
		);
	}
}
export default withRouter(HostPage);
