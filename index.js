const SWProxy = require("./ProxyAnalysis");
const fs = require("fs-extra");
const _ = require("lodash");
global.gMapping = require("./mapping");
global.appVersion = "testVersion";

const path = require("path");

// let defaultFilePath = path.join(app.getPath("desktop"), `${app.name} Files`);
let defaultFilePath = `/Users/yongkim/Desktop/test/APIs`;
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

const proxy = new SWProxy();

proxy.on("error", () => {});

// const ip = proxy.getInterfaces();
// const port = "8080";

global.plugins = loadPlugins();

function loadPlugins() {
	// Initialize Plugins
	let plugins = [];

	const pluginDirs = [
		path.join(__dirname, "plugins"),
		// path.join(global.config.Config.App.filesPath, "plugins"),
	];

	// Load each plugin module in the folder
	pluginDirs.forEach((dir) => {
		const filteredPlugins = fs
			.readdirSync(dir)
			.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
		filteredPlugins.forEach((file) => {
			const plug = require(path.join(dir, file));

			// Check plugin for correct shape
			if (
				plug.defaultConfig &&
				plug.pluginName &&
				plug.pluginDescription &&
				typeof plug.init === "function"
			) {
				plugins.push(plug);
			} else {
				proxy.log({
					type: "error",
					source: "proxy",
					message: `Invalid plugin ${file}. Missing one or more required module exports.`,
				});
			}
		});
	});

	// Initialize plugins
	plugins.forEach((plug) => {
		// try to parse JSON for textareas
		config.Config.Plugins[plug.pluginName] = _.merge(
			plug.defaultConfig,
			config.Config.Plugins[plug.pluginName]
		);
		Object.entries(config.Config.Plugins[plug.pluginName]).forEach(
			([key, value]) => {
				if (
					plug.defaultConfigDetails &&
					plug.defaultConfigDetails[key] &&
					plug.defaultConfigDetails[key].type &&
					plug.defaultConfigDetails[key].type === "textarea"
				) {
					try {
						const parsedValue = JSON.parse(value);
						config.Config.Plugins[plug.pluginName][key] = parsedValue;
					} catch (error) {
						// JSON parsing didn't work, do nothing
					}
				}
			}
		);
		config.ConfigDetails.Plugins[plug.pluginName] =
			plug.defaultConfigDetails || {};
		try {
			plug.init(proxy, config);
		} catch (error) {
			proxy.log({
				type: "error",
				source: "proxy",
				message: `Error initializing ${plug.pluginName}: ${error.message}`,
			});
		}
	});

	return plugins;
}

proxy.start(config.Config.Proxy.port);

// ipcMain.on("proxyIsRunning", (event) => {
// 	event.returnValue = proxy.isRunning();
// });

// ipcMain.on("proxyGetInterfaces", (event) => {
// 	event.returnValue = proxy.getInterfaces();
// });

// ipcMain.on("proxyStart", () => {
// 	proxy.start(config.Config.Proxy.port);
// });

// ipcMain.on("proxyStop", () => {
// 	proxy.stop();
// });

// ipcMain.on("getCert", async () => {
// 	const fileExists = await fs.pathExists(
// 		path.join(app.getPath("userData"), "swcerts", "certs", "ca.pem")
// 	);
// 	if (fileExists) {
// 		const copyPath = path.join(
// 			global.config.Config.App.filesPath,
// 			"cert",
// 			"ca.pem"
// 		);
// 		await fs.copy(
// 			path.join(app.getPath("userData"), "swcerts", "certs", "ca.pem"),
// 			copyPath
// 		);
// 		proxy.log({
// 			type: "success",
// 			source: "proxy",
// 			message: `Certificate copied to ${copyPath}.`,
// 		});
// 	} else {
// 		proxy.log({
// 			type: "info",
// 			source: "proxy",
// 			message:
// 				"No certificate available yet. You might have to start the proxy once and then try again.",
// 		});
// 	}
// });