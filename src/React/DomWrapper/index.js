import React from "react";
import { BrowserRouter, Route } from 'react-router-dom';

import * as ROUTES from '../Constants/Routes';
import { COOKIE_NAME } from '../Constants/Cookies';

import { getCookie } from '../Cookie';
import Result, { postJSONFromServer } from '../FetchWrapper';
import Header from './Header';
import GameBrowser from '../GameBrowser';
import Game from '../Game';
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
      if(Result.isSuccess(res)) {
        const { username: resUser, data = {} } = Result.getMessage(res);
        this.setLoginState(resUser, data);
      }
    }
  }

  getLoginState = () => {
    return this.state.loginState;
  }

  setLoginState = (username, data) => {
    this.setState({
      loginState: {
        username,
        data,
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
          <Route 
            path={ROUTES.GAME_BROWSER} 
            render={
              () => (
                <GameBrowser 
                  loginState={this.state.loginState}
                />
              )
            }
          />
          <Route path={ROUTES.GAME} component={Game} />
        </div>
      </BrowserRouter>
    )
  }
}

export default DomWrapper;
