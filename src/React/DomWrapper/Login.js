import React, { Component } from 'react';
import Styled from "styled-components";

import { postJSONFromServer } from '../FetchWrapper';

const LoginWrapper = Styled.div`
    padding: 1em;

    display: grid;
    grid-template-areas: 
        "username password"
        "signUp signIn"
        ${props => props.error ? "error error" : ''};
`;

const ErrorWrapper = Styled.div`
    grid-area: error;
`;

const LoggedInWrapper = Styled.div`
    padding: 1em;
    text-align: center;

    display: grid;
    grid-template-areas:
        "welcome"
        "logOut";

    * {
        margin: 0.5em;
    }
`;


const INITIAL_STATE = {
    username: '',
    password: '',
    error: null,
};

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
    }

    updateLoginState = (username) => {
        this.setState({ ...INITIAL_STATE });
        if(this.props.setLoginState) {
            this.props.setLoginState(username);
        }
    }

    onLogin = async (event) => {
        const { username, password } = this.state;
        const res = await postJSONFromServer('/account/login', { username, password });
        if(res.success) {
            this.updateLoginState(username);
        }
    };

    onCreate = async (event) => {
        const { username, password } = this.state;
        const res = await postJSONFromServer('/account/login', { username, password });
        if(res.success) {
            this.updateLoginState(username);
        }
    }

    onLogout = async (event) => {
        const { 
            props: {
                loginState: {
                    username,
                } = {},
            } = {},
        } = this;

        if(username) {
            const res = await postJSONFromServer('/account/logout');
            if(res.success) {
                // explicitly clear login state
                this.updateLoginState(null);
            }
        }
    }

    onType = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const {
            props: {
                loginState: {
                    username: loggedInUsername,
                } = {},
            } = {},
            state: {
                username = '', 
                password = '', 
                error = ''
            } = {}, 
        } = this;
        
        if(loggedInUsername) {
            return (
                <LoggedInWrapper>
                    <div>
                        {`Welcome ${loggedInUsername}!`}
                    </div>
                    <button
                        type="submit"
                        onClick={this.onLogout}
                    >
                        Log Out
                    </button>
                </LoggedInWrapper>
            )
        }


        const isInvalid = password === '' || username === '';
        return (
            <LoginWrapper>
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
                        <button 
                            disabled={isInvalid} 
                            type="submit"
                            onClick={this.onCreate}
                        >
                            Sign Up
                        </button>
                        {error && (
                            <ErrorWrapper>
                                {error}
                            </ErrorWrapper>
                        )}
            </LoginWrapper>
        );
    }
}
export default LoginPage

