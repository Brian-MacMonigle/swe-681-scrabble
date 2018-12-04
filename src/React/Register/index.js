
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

class Register extends Component{
    constructor(props){
        super(props);

        this.state = { ...INITIAL_STATE}
    }
    onSubmit = event => {
        const {email, password} = this.state;

        this.props.Database
            .create(email, password)
            .then(() => {
                this.setState({...INITIAL_STATE});
            })
            .catch(error => {
                this.setState({error});
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
            password,
            passwordTwo,
            error,
        } = this.state;

        const isInvalid =
            password !== passwordTwo ||
            password === '' ||
            email === '' ||
            username === '';

        return (
            <React.Fragment>
                <Title>
                    Register
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
                            name="password"
                            value={password}
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

export default Register;
