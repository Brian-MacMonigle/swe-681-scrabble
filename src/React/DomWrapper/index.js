import React from "react";
import { BrowserRouter, Route } from 'react-router-dom';

import * as ROUTES from '../constants/routes';
import { COOKIE_NAME } from '../constants/cookies';

import { getCookie } from '../Cookie';
import { postJSONFromServer } from '../FetchWrapper';
import Header from './Header'
import Register from '../Register';
import FetchedBoard from '../Board';
import Home from '../Home';

class DomWrapper extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loginState: {
        username: null,
      }
    }
    this.tryLoginWithCookie();
  }

  tryLoginWithCookie = async () => {
    const { username } = getCookie(COOKIE_NAME);
    if(username) {
      const res = await postJSONFromServer('/account/login/token');
      console.log('tryLoginWithCookie: ', this, '\nusername: ', username, '\nres: ', res);
      if(res.success) {
        this.setLoginState(username);
      }
    }
  }

  getLoginState = () => {
    return this.state.loginState;
  }

  setLoginState = (username) => {
    this.setState({
      loginState: {
        username,
      }
    })
  }

  render() {
    return(
      <BrowserRouter>
        <div>
          <Header 
            setLoginState={this.setLoginState}
            loginState={this.state.loginState}
          />
          <hr />
          <Route exact path={ROUTES.HOME} component={Home} />
          <Route path={ROUTES.REGISTER} component={Register} />
          <Route path={ROUTES.GAME} component={FetchedBoard} />
        </div>
      </BrowserRouter>
    )
  }
}

export default DomWrapper;
