import React, { Component } from 'react';
import Styled from "styled-components";

import { postJSONFromServer } from '../FetchWrapper';

const Front = Styled.div`
	font-size: 1em;
	margin-top: 2em;
	text-align: center;
`;

const INITIAL_STATE = {
    username: '',
    password: '',
    error: null,
};

class LoginPage extends Component {
    constructor(props) {
        super(props);

        console.log("LoginPage: ", this);

        this.state = { ...INITIAL_STATE };
    }

    onLogin = async (event) => {
        const { username, password } = this.state;
        const res = await postJSONFromServer('/account/login', { username, password });
        console.log('Res: ', res);
    };

    onType = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { username, password, error } = this.state;

        const isInvalid = password === '' || username === '';

        return (
            <React.Fragment>
                <Front>
                    <h1>Login</h1>
                    <div>
                        <input
                            name="username"
                            value={username}
                            onChange={this.onType}
                            type="text"
                            placeholder="Username"
                        />
                        <input
                            name="password"
                            value={password}
                            onChange={this.onType}
                            type="password"
                            placeholder="Password"
                        />
                        <button 
                            disabled={isInvalid} 
                            type="submit"
                            onClick={this.onLogin}
                        >
                            Sign In
                        </button>

                        {error && <p>{error.message}</p>}
                    </div>
                </Front>
            </React.Fragment>
        );
    }
}
export default LoginPage

