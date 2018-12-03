import React, { Component } from 'react';
import Styled from 'styled-components';



const INITIAL_STATE = {
    username: '',
    email: '',
    password1: '',
    password2: '',
    error: null,
};

const Title = Styled.h1`
	font-size: 1em;
	margin-top: 2em;
	text-align: center;
`;

class ResgisterForm extends Component{
    constructor(props){
        super(props);

        this.state = { ...INITIAL_STATE}
    }
    onSubmit = event => {
        const {  email, passwordOne } = this.state;

        this.props
            .create(email, passwordOne)
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
        const {
            username,
            email,
            passwordOne,
            passwordTwo,
            error,
        } = this.state;

        const isInvalid =
            passwordOne !== passwordTwo ||
            passwordOne === '' ||
            email === '' ||
            username === '';

        return (
            <React.Fragment>
                <Title>
                    <h1>Register</h1>
                    <form onSubmit={this.onSubmit}>
                        <input
                            name="username"
                            value={username}
                            onChange={this.onChange}
                            type="text"
                            placeholder="Full Name"
                        />
                        <input
                            name="email"
                            value={email}
                            onChange={this.onChange}
                            type="text"
                            placeholder="Email Address"
                        />
                        <input
                            name="passwordOne"
                            value={passwordOne}
                            onChange={this.onChange}
                            type="password"
                            placeholder="Password"
                        />
                        <input
                            name="passwordTwo"
                            value={passwordTwo}
                            onChange={this.onChange}
                            type="password"
                            placeholder="Confirm Password"
                        />
                        <button disabled={isInvalid} type="submit">
                            Sign Up
                        </button>

                        {error && <p>{error.message}</p>}
                    </form>
                </Title>
            </React.Fragment>
        );
    }
}

export default ResgisterForm;
