import React from "react";
import Styled from "styled-components";
import { Link } from "react-router-dom";

import * as ROUTES from "../Constants/Routes";
import Login from "./Login";

const HeaderWrapper = Styled.div`
    display: flex;
    justify-content: space-between;
`;

const Header = props => (
    <HeaderWrapper>
        <ul>
            <li>
                <Link to={ROUTES.HOME}>Home</Link>
            </li>
            <li>
                <Link to={ROUTES.HOST}>Host</Link>
            </li>
            <li>
                <Link to={ROUTES.GAME_BROWSER}>Game Browser</Link>
            </li>
        </ul>
        <Login {...props} />
    </HeaderWrapper>
);

export default Header;
