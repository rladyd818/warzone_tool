import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import Layout from "./pages/Layout";
import Top from "./pages/Top";

ReactDOM.render(
	<BrowserRouter>
		<Switch>
			<Layout>
				<Route exact path="/" component={Top} />
				{/* <Route exact path="/top" component={Top} /> */}
				<Redirect to="/" />
			</Layout>
		</Switch>
	</BrowserRouter>,
	document.getElementById("app")
);
