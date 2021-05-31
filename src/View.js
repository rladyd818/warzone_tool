import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import Layout from "./pages/Layout";
import Log from "./pages/Log";
import Dungeon from "./pages/Dungeon";
import Raid from "./pages/Raid";
import Arena from "./pages/Arena";
import Common from "./pages/Common";

ReactDOM.render(
	<BrowserRouter>
		<Switch>
			<Layout>
				<Route exact path="/" component={Log} />
				<Route exact path="/dungeon" component={Dungeon} />
				<Route exact path="/raid" component={Raid} />
				<Route exact path="/arena" component={Arena} />
				<Route exact path="/common" component={Common} />
				{/* <Route exact path="/top" component={Top} /> */}
				<Redirect to="/" />
			</Layout>
		</Switch>
	</BrowserRouter>,
	document.getElementById("app")
);
