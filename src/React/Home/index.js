import React from "react";

const Home = () => (
	<div>
		<h1>SWE 681 Scrabble</h1>
		<p>
			This website was made by Brian MacMonigle & Matthew Satyshur for our
			SWE 681 Final Assigment
		</p>
		<p>
			The rules are really similar to scrabble, but with a few features :D
		</p>
		<ul>
			<li>
				Points are scored a little differently. You will only get points
				for tiles that you have placed. This means that if you add an
				's' to some one elses word, you will only gain those points
			</li>
			<li>
				The game ends when there are no more tiles to distribute between
				the players. This means that you will always have at least 7
				tiles.
			</li>
			<li>You must sign in to play a game.</li>
			<li>You must either host or join a game.</li>
			<li>Only two players are supported at the moment.</li>
			<li>Most importantly: have fun!</li>
		</ul>
	</div>
);

export default Home;
