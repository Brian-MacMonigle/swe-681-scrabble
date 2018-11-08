import React from "react";
import { NavLink } from "react-router-dom";

export const HOME = "/";
export const JUST_BOARD = "/just/board";

const allRoutes = [HOME, JUST_BOARD];

export const LinkTo = ({ to, alwaysReturn, ...props }) => {
	if (!allRoutes.find(route => route === to)) {
		return <NavLink to={HOME} />;
	}
	return <NavLink to={to} {...props} />;
};
