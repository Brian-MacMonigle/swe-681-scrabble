import React from "react";

import { LinkTo, JUST_BOARD } from "../Routes";

const HomePage = () => (
	<div>
		I am the home page.
		<div>
			<LinkTo to={JUST_BOARD}>Visit the Game Board.</LinkTo>
		</div>
	</div>
);

export default HomePage;
