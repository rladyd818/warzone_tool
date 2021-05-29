import React from "react";
import Header from "../container/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import "../css/Layout.css";

function Layout({ children, match, location, history }) {
	return (
		<>
			<Header />
			<Sidebar>{children}</Sidebar>
			<Footer />
		</>
	);
}

export default Layout;
