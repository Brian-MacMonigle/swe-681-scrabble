import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";

import { HOME, JUST_BOARD } from "../Routes";
import Header from "../Header";
import HomePage from "../HomePage";
import { FetchedBoard } from "../Board";

const DomWrapper = props => (
	<BrowserRouter>
		<Header />
		<Switch>
			<Route exact path={HOME} component={HomePage} />
			<Route path={JUST_BOARD} component={FetchedBoard} />
		</Switch>
	</BrowserRouter>
);

export default DomWrapper;
