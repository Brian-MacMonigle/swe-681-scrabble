import React from "react";

export class LoginPage extends React.Component {
	render() {
		return (
			<div>
				<div>
					<span>Username: </span>
					<input type="text" name="username" />
				</div>
				<div>
					<span>password: </span>
					<input type="password" name="password" />
				</div>
				<div>
					<input type="submit" name="submit" />
				</div>
			</div>
		);
	}
}

export default class LoginWrapper extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loggedIn: false
		};
	}

	render() {
		if (!this.state.loggedIn) {
			return <LoginPage />;
		}
		return this.props.children;
	}
}
