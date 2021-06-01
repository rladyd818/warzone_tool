const SWProxy = require("./proxy/ProxyAnalysis");
const fs = require("fs-extra");
// const storage = require("electron-json-storage");
// const windowStateKeeper = require("electron-window-state");
const _ = require("lodash");
const { app, BrowserWindow, ipcMain } = require("electron");

const url = require("url");
const path = require("path");
const isDev = require("electron-is-dev");

const extraPath = isDev
	? path.join(process.cwd(), "extraResources")
	: path.join(process.resourcesPath, "extraResources");

const userSettingPath = path.join(extraPath, "userSetting.json");
global.userSetting = fs.readJSONSync(userSettingPath);
console.log("초기 세팅 userSetting값", global.userSetting);
// const userSettingPath = path.join(extraPath, "userSetting.json");
// global.userSetting = fs.readJSONSync(userSettingPath);

global.gMapping = require("./mapping");
global.appVersion = "testVersion";

let defaultFilePath = path.join(app.getPath("desktop"), `${app.name} Files`);
let defaultConfig = {
	Config: {
		App: {
			filesPath: defaultFilePath,
			debug: false,
			clearLogOnLogin: false,
			maxLogEntries: 100,
			httpsMode: true,
			minimizeToTray: false,
			extraPath: extraPath,
			userSettingPath: userSettingPath,
		},
		Proxy: { port: 8080, autoStart: false },
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

	const startUrl =
		process.env.ELECTRON_START_URL ||
		url.format({
			pathname: path.join(__dirname, "index.html"),
			protocol: "file:",
			slashes: true,
		});

	// const startUrl = isDev
	// 	? "http://localhost:8080"
	// 	: process.env.ELECTRON_START_URL ||
	// 	  url.format({
	// 			pathname: path.join(__dirname, "index.html"),
	// 			protocol: "file:",
	// 			slashes: true,
	// 	  });

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

// let dungeonPath = path.join(__dirname, "plugins", "dungeon");
// console.log(dungeonPath);
// global.config.Config.plugins["dungeon"] = require(`./plugins/dungeon`);
// const dungeon = require(`./plugins/dungeon`);
// config.Config.plugins.dungeon = dungeon;

// // setInterval(() => {});
// for (let key in config.Config.plugins) {
// 	config.Config.plugins[key].init(proxy, global.userSetting);
// }

const proxy = new SWProxy();

proxy.on("error", () => {});

ipcMain.on("getExtraPath", (event) => {
	event.returnValue = config.Config.App.extraPath;
});

// 프록시 러닝상태 체크
ipcMain.on("proxyIsRunning", (event) => {
	event.returnValue = proxy.isRunning();
});

ipcMain.on("proxyGetInterfaces", (event) => {
	event.returnValue = proxy.getInterfaces();
});

ipcMain.on("proxyStart", () => {
	proxy.start(config.Config.Proxy.port);
});

ipcMain.on("proxyStop", () => {
	proxy.stop();
});

ipcMain.on("updatePort", (context, args) => {
	config.Config.Proxy.port = args;
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

ipcMain.on("getUserSetting", (context, args) => {
	console.log("ipcMain에 getUserSetting들어옴");
	console.log(args);
	context.returnValue = global.userSetting[args];
});

ipcMain.on("updateSetting", (context, args) => {
	console.log("updateSetting들어옴");
	global.userSetting[args.key] = args.value;
	console.log("update후에 userSetting값: ", global.userSetting);

	config.Config.Plugins[args.key].updateUserSetting(
		global.userSetting[args.key]
	);
	saveSetting();
	context.returnValue = true;
});

ipcMain.on("saveSetting", () => {
	saveSetting();
});

const saveSetting = () => {
	fs.writeJSONSync(config.Config.App.userSettingPath, global.userSetting);
};

// 나중에 iterator로 require하도록 수정해야함.
const dungeon = require(`./plugins/dungeon`);
const raid = require(`./plugins/raid`);
global.config.Config.Plugins.dungeonMode = dungeon;
global.config.Config.Plugins.raidMode = raid;

// setInterval(() => {});
for (let key in config.Config.Plugins) {
	global.config.Config.Plugins[key].init(proxy, global.userSetting);
}

// app.on("ready", () => {
// 	app.setAppUserModelId(process.execPath);
// 	createWindow();

// 	if (process.platform === "darwin") {
// 		// Create our menu entries so that we can use MAC shortcuts like copy & paste
// 		Menu.setApplicationMenu(
// 			Menu.buildFromTemplate([
// 				{
// 					label: "Edit",
// 					submenu: [
// 						{ role: "undo" },
// 						{ role: "redo" },
// 						{ type: "separator" },
// 						{ role: "cut" },
// 						{ role: "copy" },
// 						{ role: "paste" },
// 						{ role: "pasteandmatchstyle" },
// 						{ role: "delete" },
// 						{ role: "selectall" },
// 					],
// 				},
// 			])
// 		);
// 	}

// 	storage.getAll((error, data) => {
// 		if (error) throw error;

// 		global.config = _.merge(defaultConfig, data);
// 		global.config.ConfigDetails = defaultConfigDetails.ConfigDetails;

// 		fs.ensureDirSync(global.config.Config.App.filesPath);
// 		fs.ensureDirSync(path.join(global.config.Config.App.filesPath, "plugins"));

// 		// global.plugins = loadPlugins();

// 		if (process.env.autostart || global.config.Config.Proxy.autoStart) {
// 			proxy.start(process.env.port || config.Config.Proxy.port);
// 		}
// 	});
// });

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
