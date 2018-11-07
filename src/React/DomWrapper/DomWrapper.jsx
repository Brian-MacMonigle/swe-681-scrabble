import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";

import { HOME, JUST_BOARD } from "../Routes";
import Header from "../Header";
import LoginWrapper from "../LoginWrapper";
import HomePage from "../HomePage";
import { FetchedBoard } from "../Board";

const DomWrapper = props => (
	<BrowserRouter>
		<React.Fragment>
			<Header />
			<LoginWrapper>
				<Switch>
					<Route exact path={HOME} component={HomePage} />
					<Route path={JUST_BOARD} component={FetchedBoard} />
				</Switch>
			</LoginWrapper>
		</React.Fragment>
	</BrowserRouter>
);

export default DomWrapper;
