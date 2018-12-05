import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Route} from 'react-router-dom';
import Navigation from './Navigation'
import Register from './Register';
import Login from './Login';
import FetchedBoard from './Board';
import Home from './Home';

import * as ROUTES from './constants/routes';


// eslint-disable-next-line no-unused-vars
class App2 extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return(
      <BrowserRouter>
        <div>
        <Navigation />

        <hr />

          <Route exact path={ROUTES.HOME} component={Home} />
          <Route path={ROUTES.REGISTER} component={Register} />
          <Route path={ROUTES.LOGIN} component={Login} />
          <Route path={ROUTES.GAME} component={FetchedBoard} />

      </div>
      </BrowserRouter>
    )
  }
}

export default App;
