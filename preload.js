const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronProxy", {
	onProxyStarted: (callback) => {
		ipcRenderer.on("proxyStarted", (event, args) => {
			callback(args);
		});
	},
	onProxyStopped: () => {},

	removeProxyStarted: () => {
		ipcRenderer.removeAllListeners("proxyStarted");
	},

	isRunning: () => ipcRenderer.sendSync("proxyIsRunning"),
});

// window.addEventListener("DOMContentLoaded", () => {
// 	const replaceText = (selector, text) => {
// 		const element = document.getElementById(selector);
// 		if (element) element.innerText = text;
// 	};

// 	for (const type of ["chrome", "node", "electron"]) {
// 		replaceText(`${type}-version`, process.versions[type]);
// 	}
// });
