const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronProxy", {
	onProxyStarted: (callback) => {
		ipcRenderer.on("proxyStarted", (event, args) => {
			callback(args);
		});
	},
	onProxyStopped: (callback) => {
		ipcRenderer.on("proxyStopped", (event, args) => {
			callback(args);
		});
	},

	removeProxyStarted: () => {
		ipcRenderer.removeAllListeners("proxyStarted");
	},

	removeProxyStopped: () => {
		ipcRenderer.removeAllListeners("proxyStopped");
	},

	isRunning: () => ipcRenderer.sendSync("proxyIsRunning"),

	proxyStart: () => ipcRenderer.sendSync("proxyStart"),

	proxyStop: () => ipcRenderer.sendSync("proxyStop"),

	proxyGetInterfaces: () => ipcRenderer.sendSync("proxyGetInterfaces"),
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
