import React, { Component } from 'react';

import Styled from "styled-components";

const Front = Styled.h1`
	font-size: 1em;
	margin-top: 2em;
	text-align: center;
`;

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null,
};

class LoginPage extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        const { email, password } = this.state;

        this.props
            .login(email, password)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
            })
            .catch(error => {
                this.setState({ error });
            });

        event.preventDefault();
    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { email, password, error } = this.state;

        const isInvalid = password === '' || email === '';

        return (
            <React.Fragment>
                <Front>
                    <h1>Login</h1>
                    <form onSubmit={this.onSubmit}>
                        <input
                            name="email"
                            value={email}
                            onChange={this.onChange}
                            type="text"
                            placeholder="Email Address"
                        />
                        <input
                            name="password"
                            value={password}
                            onChange={this.onChange}
                            type="password"
                            placeholder="Password"
                        />
                        <button disabled={isInvalid} type="submit">
                            Sign In
                        </button>

                        {error && <p>{error.message}</p>}
                    </form>
                </Front>
            </React.Fragment>
        );
    }
}
export default LoginPage

