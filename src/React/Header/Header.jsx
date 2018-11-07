import React from "react";
import styled from "styled-components";

import { LinkTo, HOME, JUST_BOARD } from "../Routes";

const PADDING = 15;
const HEIGHT = 50 + 2 * PADDING;

const HeaderWrapper = styled.div`
	top: 0px;
	height: ${HEIGHT}px;
	position: fixed;
	background-color: green;
	width: 100%;
	margin: 0;
	padding: ${PADDING}px;
	box-sizing: border-box;
`;

const RestOfPageOffsetWrapper = styled.div`
	margin-top: ${HEIGHT}px;
`;

const Header = () => (
	<HeaderWrapper>
		<LinkTo to={HOME}>Home</LinkTo>
		<LinkTo to={JUST_BOARD}>Game Board</LinkTo>
		<div>SOME MORE TEXT FOR THE HEADER</div>
	</HeaderWrapper>
);

export default Header;
export { RestOfPageOffsetWrapper };
