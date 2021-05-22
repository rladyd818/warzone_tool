import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../css/Layout.css";

function Layout({ children, match, location, history }) {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	);
}

export default Layout;
