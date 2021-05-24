const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronProxy", {
	onProxyStarted: (callback) => {
		ipcRenderer.on("proxyStarted", (event, args) => {
			console.log("onProxyStarted에는 들어왔다 지금");
			callback(true);
		});
	},

	onProxyStopped: (callback) => {
		ipcRenderer.on("proxyStopped", (event, args) => {
			console.log("onProxyStopped에 들어왔다 지금");
			callback(false);
		});
	},

	onCommand: (callback) => {
		ipcRenderer.on("onCommand", (event, args) => {
			// console.log("onCommand들어옴");
			callback(args);
		});
	},

	removeProxyStarted: () => {
		console.log("started삭제에 들어왔니?");
		ipcRenderer.removeAllListeners("proxyStarted");
	},

	removeProxyStopped: () => {
		console.log("stopped삭제에 들어왔니?");
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
