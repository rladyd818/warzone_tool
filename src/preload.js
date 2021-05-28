const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronProxy", {
	onProxyStarted: (callback) => {
		ipcRenderer.on("proxyStarted", (event, args) => {
			callback(true);
		});
	},

	onProxyStopped: (callback) => {
		ipcRenderer.on("proxyStopped", (event, args) => {
			callback(false);
		});
	},

	onCommand: (callback) => {
		ipcRenderer.on("onCommand", (event, args) => {
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

	proxyStart: () => ipcRenderer.send("proxyStart"),

	proxyStop: () => ipcRenderer.send("proxyStop"),

	proxyGetInterfaces: () => ipcRenderer.sendSync("proxyGetInterfaces"),

	getCert: () => ipcRenderer.send("getCert"),

	updatePort: (data) => {
		ipcRenderer.send("updatePort", data);
	},

	getAlarmPath: () => ipcRenderer.sendSync("getAlarmPath"),
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
