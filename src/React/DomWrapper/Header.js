import React from 'react';
import { Link } from 'react-router-dom';

import * as ROUTES from '../constants/routes';

const Header = () => (
    <div>
        <ul>
            <li>
                <Link to={ROUTES.LOGIN}>Login</Link>
            </li>
            <li>
                <Link to={ROUTES.HOME}>Home</Link>
            </li>
            <li>
                <Link to={ROUTES.GAME}>Game</Link>
            </li>
        </ul>
    </div>
);

export default Header;
