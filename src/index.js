import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

// import Layout from "./pages/Layout";
// import Logs from "./pages/Logs";
// import Settings from "./pages/Settings";
// import Help from "./pages/Help";

import Main from "./pages/Main";
import Top from "./pages/Top";

ReactDOM.render(
	<BrowserRouter>
		<Switch>
			<Route exact path="/" component={Main} />
			{/* <Route exact path="/top" component={Top} /> */}
			<Redirect to="/" />
		</Switch>
	</BrowserRouter>,
	document.getElementById("app")
);
