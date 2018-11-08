import React from "react";

import { Textbox, PasswordBox, Button, Form } from "../CommonComponents";

export class LoginPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			usernameValue: "",
			passwordValue: ""
		};
	}

	onTextChange = (event, propName) => {
		this.setState({
			[propName]: event.target.value
		});
	};

	render() {
		return (
			<div>
				<div>
					<span>Username: </span>
					<Textbox
						value={this.state.usernameValue}
						onChange={e => this.onTextChange(e, "usernameValue")}
					/>
				</div>
				<div>
					<span>password: </span>
					<PasswordBox
						value={this.state.passwordValue}
						onChange={e => this.onTextChange(e, "passwordValue")}
					/>
				</div>
				<div>
					<Button onChange={() => null} value="login" />
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

		this.LoginContext = React.createContext({
			loggedIn: this.state.loggedIn
		});
	}

	render() {
		const { LoginContext, state: { loggedIn = false } = {} } = this;
		console.log("LoginWrapper: ", "\nloggedIn: ", loggedIn);
		return (
			<LoginContext.Provider value={loggedIn}>
				{loggedIn ? this.props.children : <LoginPage />}
			</LoginContext.Provider>
		);
	}
}
