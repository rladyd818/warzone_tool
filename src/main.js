const SWProxy = require("./proxy/ProxyAnalysis");
const fs = require("fs-extra");
const storage = require("electron-json-storage");
// const windowStateKeeper = require("electron-window-state");
const _ = require("lodash");
const { app, BrowserWindow, ipcMain } = require("electron");

const url = require("url");
const path = require("path");
const isDev = require("electron-is-dev");

global.gMapping = require("./mapping");
global.appVersion = "testVersion";

let defaultFilePath = path.join(app.getPath("desktop"), `${app.name} Files`);
// console.log(path.join(app.getPath("desktop"), `${app.name} Files`));
// let defaultFilePath = `/Users/yongkim/Desktop/test/APIs`;
let defaultConfig = {
	Config: {
		App: {
			filesPath: defaultFilePath,
			debug: false,
			clearLogOnLogin: false,
			maxLogEntries: 100,
			httpsMode: true,
			minimizeToTray: false,
		},
		Proxy: { port: 3333, autoStart: false },
		Plugins: {},
	},
};
let defaultConfigDetails = {
	ConfigDetails: {
		App: {
			debug: { label: "Show Debug Messages" },
			clearLogOnLogin: { label: "Clear Log on every login" },
			maxLogEntries: { label: "Maximum amount of log entries." },
			httpsMode: { label: "HTTPS mode" },
			minimizeToTray: { label: "Minimize to System Tray" },
		},
		Proxy: { autoStart: { label: "Start proxy automatically" } },
		Plugins: {},
	},
};

global.config = defaultConfig;
global.config.ConfigDetails = defaultConfigDetails.ConfigDetails;

// 바탕화면에 경로생성
fs.ensureDirSync(global.config.Config.App.filesPath);
fs.ensureDirSync(path.join(global.config.Config.App.filesPath, "plugins"));

function createWindow() {
	const win = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, "./preload.js"),
			// nodeIntegration: true,
			// enableRemoteModule: true,
			contextIsolation: true,
		},
		width: 800,
		height: 600,
	});

	global.win = win;

	const startUrl = isDev
		? "http://localhost:8080"
		: process.env.ELECTRON_START_URL ||
		  url.format({
				pathname: path.join(__dirname, "index.html"),
				protocol: "file:",
				slashes: true,
		  });

	global.win.loadURL(startUrl);

	// if (isDev) {
	global.win.webContents.openDevTools();
	// }

	global.win.on("closed", () => {
		global.win = null;
	});
}

app.on("ready", () => {
	createWindow();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (global.win === null) {
		createWindow();
	}
});

const proxy = new SWProxy();

proxy.on("error", () => {});

// 프록시 러닝상태 체크
ipcMain.on("proxyIsRunning", (event) => {
	console.log("isRunning에 들어왔는지 확인한다.!!!!!!!!!");
	event.returnValue = proxy.isRunning();
});

ipcMain.on("proxyGetInterfaces", (event) => {
	event.returnValue = proxy.getInterfaces();
});

ipcMain.on("proxyStart", () => {
	console.log("proxyStart 들어온거 맞니?");
	proxy.start(config.Config.Proxy.port);
});

ipcMain.on("proxyStop", () => {
	console.log("proxyStop 들어온거 맞니?");
	proxy.stop();
});

ipcMain.on("greeting", (context, args) => {
	console.log(context, args);
	context.returnValue = "nice";
	// context.sender.send("greeting", "nice");
});
ipcMain.on("getCert", async () => {
	const fileExists = await fs.pathExists(
		path.join(app.getPath("userData"), "swcerts", "certs", "ca.pem")
	);
	if (fileExists) {
		const copyPath = path.join(
			global.config.Config.App.filesPath,
			"cert",
			"ca.pem"
		);
		await fs.copy(
			path.join(app.getPath("userData"), "swcerts", "certs", "ca.pem"),
			copyPath
		);
		proxy.log({
			type: "success",
			source: "proxy",
			message: `Certificate copied to ${copyPath}.`,
		});
	} else {
		proxy.log({
			type: "info",
			source: "proxy",
			message:
				"No certificate available yet. You might have to start the proxy once and then try again.",
		});
	}
});

// const ip = proxy.getInterfaces();
// const port = "8080";

// global.plugins = loadPlugins();

// function loadPlugins() {
// 	// Initialize Plugins
// 	let plugins = [];

// 	const pluginDirs = [
// 		path.join(__dirname, "plugins"),
// 		path.join(global.config.Config.App.filesPath, "plugins"),
// 	];

// 	// Load each plugin module in the folder
// 	pluginDirs.forEach((dir) => {
// 		const filteredPlugins = fs
// 			.readdirSync(dir)
// 			.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
// 		filteredPlugins.forEach((file) => {
// 			const plug = require(path.join(dir, file));

// 			// Check plugin for correct shape
// 			if (
// 				plug.defaultConfig &&
// 				plug.pluginName &&
// 				plug.pluginDescription &&
// 				typeof plug.init === "function"
// 			) {
// 				plugins.push(plug);
// 			} else {
// 				proxy.log({
// 					type: "error",
// 					source: "proxy",
// 					message: `Invalid plugin ${file}. Missing one or more required module exports.`,
// 				});
// 			}
// 		});
// 	});

// 	// Initialize plugins
// 	plugins.forEach((plug) => {
// 		// try to parse JSON for textareas
// 		config.Config.Plugins[plug.pluginName] = _.merge(
// 			plug.defaultConfig,
// 			config.Config.Plugins[plug.pluginName]
// 		);
// 		Object.entries(config.Config.Plugins[plug.pluginName]).forEach(
// 			([key, value]) => {
// 				if (
// 					plug.defaultConfigDetails &&
// 					plug.defaultConfigDetails[key] &&
// 					plug.defaultConfigDetails[key].type &&
// 					plug.defaultConfigDetails[key].type === "textarea"
// 				) {
// 					try {
// 						const parsedValue = JSON.parse(value);
// 						config.Config.Plugins[plug.pluginName][key] = parsedValue;
// 					} catch (error) {
// 						// JSON parsing didn't work, do nothing
// 					}
// 				}
// 			}
// 		);
// 		config.ConfigDetails.Plugins[plug.pluginName] =
// 			plug.defaultConfigDetails || {};
// 		try {
// 			plug.init(proxy, config);
// 		} catch (error) {
// 			proxy.log({
// 				type: "error",
// 				source: "proxy",
// 				message: `Error initializing ${plug.pluginName}: ${error.message}`,
// 			});
// 		}
// 	});

// 	return plugins;
// }

// proxy.start(config.Config.Proxy.port);

// ipcMain.on("proxyIsRunning", (event) => {
// 	event.returnValue = proxy.isRunning();
// });

// // ipcMain.on("proxyGetInterfaces", (event) => {
// // 	event.returnValue = proxy.getInterfaces();
// // });

// // ipcMain.on("proxyStart", () => {
// // 	proxy.start(config.Config.Proxy.port);
// // });

// // ipcMain.on("proxyStop", () => {
// // 	proxy.stop();
// // });

// // ipcMain.on("getCert", async () => {
// // 	const fileExists = await fs.pathExists(
// // 		path.join(app.getPath("userData"), "swcerts", "certs", "ca.pem")
// // 	);
// // 	if (fileExists) {
// // 		const copyPath = path.join(
// // 			global.config.Config.App.filesPath,
// // 			"cert",
// // 			"ca.pem"
// // 		);
// // 		await fs.copy(
// // 			path.join(app.getPath("userData"), "swcerts", "certs", "ca.pem"),
// // 			copyPath
// // 		);
// // 		proxy.log({
// // 			type: "success",
// // 			source: "proxy",
// // 			message: `Certificate copied to ${copyPath}.`,
// // 		});
// // 	} else {
// // 		proxy.log({
// // 			type: "info",
// // 			source: "proxy",
// // 			message:
// // 				"No certificate available yet. You might have to start the proxy once and then try again.",
// // 		});
// // 	}
// // });
