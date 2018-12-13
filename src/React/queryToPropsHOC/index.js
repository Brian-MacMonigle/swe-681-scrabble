import React from "react";
import { withRouter } from "react-router-dom";

function queryToPropsHOC(Component) {
	class QueryToProps extends React.Component {
		parseQuery = () => {
			const {
				props: { location: { search: rawQuery = "" } = {} } = {}
			} = this;
			const queries = rawQuery.split("?") || [];
			queries.shift(); // remove first questionmark

			let res = queries.reduce((acc, q) => {
				const deconstructed = q.split("=");
				return {
					...acc,
					[deconstructed[0]]: deconstructed[1]
				};
			}, {});

			return res;
		};

		render() {
			return (
				<React.Fragment>
					<Component {...this.props} {...this.parseQuery()} />
				</React.Fragment>
			);
		}
	}

	return withRouter(QueryToProps);
}

export default queryToPropsHOC;
