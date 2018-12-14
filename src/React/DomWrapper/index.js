import React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import * as ROUTES from "../Constants/Routes";

import Result, { postJSONFromServer } from "../FetchWrapper";
import Header from "./Header";
import Home from "../Home";
import Host from "../Host";
import GameBrowser from "../GameBrowser";
import Game from "../Game";

class DomWrapper extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loginState: {
				username: null
			}
		};

		this.tryLoginWithCookie();
	}

	tryLoginWithCookie = async () => {
		const res = await postJSONFromServer("/account/login/token");
		if (Result.isSuccess(res)) {
			const { username: resUser, data = {} } = Result.getMessage(res);
			this.setLoginState(resUser, data);
		}
	};

	getLoginState = () => {
		return this.state.loginState;
	};

	setLoginState = (username, data) => {
		this.setState({
			loginState: {
				username,
				data
			}
		});
	};

	render() {
		return (
			<BrowserRouter>
				<div>
					<Header
						setLoginState={this.setLoginState}
						loginState={this.state.loginState}
					/>
					<hr />
					<Route exact path={ROUTES.HOME} component={Home} />
					<Route
						path={ROUTES.GAME_BROWSER}
						render={() => (
							<GameBrowser loginState={this.state.loginState} />
						)}
					/>
					<Route
						path={ROUTES.HOST}
						render={() => (
							<Host loginState={this.state.loginState} />
						)}
					/>
					<Route
						path={ROUTES.GAME}
						render={() => (
							<Game loginState={this.state.loginState} />
						)}
					/>
				</div>
			</BrowserRouter>
		);
	}
}

export default DomWrapper;
