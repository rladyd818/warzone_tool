import React, { useState, useEffect } from "react";
import { Button, TextField } from "@material-ui/core";
// import { ipcRenderer, remote } from "electron";
// const { ipcRenderer, remote } = require("electron");
import "../css/Header.css";

// let config = remote.getGlobal("config");

console.log(window["electron-proxy"].doAThing());
function Header() {
	// componentDidMount() {
	//   ipcRenderer.on('proxyStarted', () => {
	//     this.setState({ proxyRunning: true });
	//   });

	//   ipcRenderer.on('proxyStopped', () => {
	//     this.setState({ proxyRunning: false });
	//   });
	// }

	// componentWillUnmount() {
	//   ipcRenderer.removeAllListeners('proxyStarted');
	//   ipcRenderer.removeAllListeners('proxyStopped');
	// }

	// toggleProxy() {
	//   if (ipcRenderer.sendSync('proxyIsRunning')) {
	//     ipcRenderer.send('proxyStop');
	//   } else {
	//     ipcRenderer.send('proxyStart');
	//   }
	// }

	// getCert() {
	//   ipcRenderer.send('getCert');
	// }

	// changePort(e) {
	//   const port = Number(e.target.value);
	//   config.Config.Proxy.port = port;
	//   ipcRenderer.send('updateConfig');
	// }
	// const { store, dispatch } = useAppContext();

	const [proxyState, setProxyState] = useState(
		window.electronProxy.isRunning()
	);

	// // proxy running상태 change
	useEffect(() => {
		ipcRenderer.on("proxyStarted", () => {
			setProxyState(true);
		});

		ipcRenderer.on("proxyStopped", () => {
			setProxyState(false);
		});
	}, []);

	// useEffect(() => {
	// 	return () => {
	// 		ipcRenderer.removeAllListeners("proxyStarted");
	// 		ipcRenderer.removeAllListeners("proxyStopped");
	// 	};
	// }, []);

	// const interfaces = ipcRenderer
	// 	.sendSync("proxyGetInterfaces")
	// 	.map((interfaceEntry, i) => ({ key: i, text: interfaceEntry, value: i }));
	return (
		<div className="header__layout">
			{/* <TextField value={interfaces}></TextField> */}
		</div>
	);
}

export default Header;
