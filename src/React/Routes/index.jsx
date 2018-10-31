import React from "react";
import { NavLink } from "react-router-dom";

export const HOME = "/";
export const JUST_BOARD = "/just/board";

export const LinkTo = ({ to, ...props }) => {
	return <NavLink to={to} {...props} />;
};
