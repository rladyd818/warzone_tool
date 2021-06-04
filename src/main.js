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
	// global.win.webContents.openDevTools();
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
	console.log(global.userSetting[args]);
	context.returnValue = global.userSetting[args];
});

ipcMain.on("updateSetting", (context, args) => {
	global.userSetting[args.key] = args.value;

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
const profile = require(`./plugins/profile`);
const worldBoss = require(`./plugins/worldBoss`);
const common = require(`./plugins/common`);
global.config.Config.Plugins.dungeonMode = dungeon;
global.config.Config.Plugins.raidMode = raid;
global.config.Config.Plugins.profile = profile;
global.config.Config.Plugins.worldBoss = worldBoss;
global.config.Config.Plugins.common = common;

for (let key in config.Config.Plugins) {
	global.config.Config.Plugins[key].init(proxy, global.userSetting);
}
