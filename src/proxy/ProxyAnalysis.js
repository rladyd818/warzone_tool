const { app } = require("electron");
const fs = require("fs-extra");
const fsOri = require("fs");
const path = require("path");
const os = require("os");
const net = require("net");
const url = require("url");
const uuidv4 = require("uuid/v4");
const Proxy = require("http-mitm-proxy");
const EventEmitter = require("events");

const {
	decrypt_request,
	decrypt_response,
	encrypt_request,
} = require("./smon_decryptor");

class SWProxy extends EventEmitter {
	constructor() {
		super();
		this.httpServer = null;
		this.proxy = null;
		this.logEntries = [];
		this.addresses = [];
		this.commandList = [];
	}
	start(port) {
		const self = this;
		this.proxy = Proxy();

		this.proxy.onError(function (ctx, e, errorKind) {
			if (e.code === "EADDRINUSE") {
				self.log({
					type: "warning",
					source: "proxy",
					message: "Port is in use from another process. Try another port.",
				});
			}
		});

		this.proxy.onRequest(function (ctx, callback) {
			// console.log("onRequest탔음");
			if (ctx.clientToProxyRequest.url.includes("/api/gateway_c2.php")) {
				ctx.use(Proxy.gunzip);
				ctx.SWRequestChunks = [];
				ctx.SWResponseChunks = [];
				ctx.onRequestData(function (ctx, chunk, callback) {
					ctx.SWRequestChunks.push(chunk);
					return callback(null, chunk);
				});

				ctx.onResponseData(function (ctx, chunk, callback) {
					ctx.SWResponseChunks.push(chunk);
					return callback(null, chunk);
				});
				ctx.onResponseEnd(function (ctx, callback) {
					let reqData;
					let respData;

					try {
						reqData = decrypt_request(
							Buffer.concat(ctx.SWRequestChunks).toString()
						);
						respData = decrypt_response(
							Buffer.concat(ctx.SWResponseChunks).toString()
						);
					} catch (e) {
						// Error decrypting the data, log and do not fire an event
						self.log({
							type: "debug",
							source: "proxy",
							message: `Error decrypting request data - ignoring. ${e}`,
						});
						return callback();
					}

					console.log("요청정보: ", reqData);
					const { command } = respData;
					const timeStamp = new Date().getTime();
					const jsonPath = path.join(
						app.getPath("desktop"),
						`${app.name} Files`,
						`APIs`,
						command
					);
					fs.ensureDirSync(jsonPath);
					fsOri.writeFile(
						`${jsonPath}/${command}_${timeStamp}_res.json`,
						JSON.stringify(respData),
						(err) => {
							if (err)
								self.log({
									type: "writeFile Error",
									source: "proxy",
									message: err,
								});
						}
					);
					fsOri.writeFile(
						`${jsonPath}/${command}_${timeStamp}_req.json`,
						JSON.stringify(reqData),
						(err) => {
							if (err)
								self.log({
									type: "writeFile Error",
									source: "proxy",
									message: err,
								});
						}
					);
					if (
						config.Config.App.clearLogOnLogin &&
						(command === "HubUserLogin" || command === "GuestLogin")
					) {
						self.clearLogs();
					}
					self.commandList.push(command);
					win.webContents.send("onCommand", self.commandList);

					// Emit events, one for the specific API command and one for all commands
					self.emit(command, reqData, respData);
					self.emit("apiCommand", reqData, respData);
					return callback();
				});
			}
			return callback();
		});
		this.proxy.onConnect(function (req, socket, head, callback) {
			const serverUrl = url.parse(`https://${req.url}`);
			if (req.url.includes("qpyou.cn") && config.Config.App.httpsMode) {
				return callback();
			} else {
				const srvSocket = net.connect(
					serverUrl.port,
					serverUrl.hostname,
					() => {
						socket.write(
							"HTTP/1.1 200 Connection Established\r\n" +
								"Proxy-agent: Node-Proxy\r\n" +
								"\r\n"
						);
						srvSocket.pipe(socket);
						socket.pipe(srvSocket);
					}
				);
				srvSocket.on("error", () => {});

				socket.on("error", () => {});
			}
		});
		this.proxy.listen(
			{ port, sslCaDir: path.join(app.getPath("userData"), "swcerts") },
			(e) => {
				console.log(
					"리스닝 하는 위치:",
					path.join(app.getPath("userData"), "swcerts")
				);
				this.log({
					type: "info",
					source: "proxy",
					message: `Now listening on port ${port}`,
				});
			}
		);
		// this.proxy.listen(
		// 	{
		// 		port,
		// 		sslCaDir: "/Users/yongkim/Desktop/test/swcerts",
		// 	},
		// 	(e) => {
		// 		if (e !== undefined) console.log("프록시 리스닝 에러", e);
		// 		this.log({
		// 			type: "info",
		// 			source: "proxy",
		// 			message: `Now listening on port ${port}`,
		// 		});
		// 	}
		// );

		if (process.env.autostart) {
			console.log(`SW Exporter Proxy is listening on port ${port}`);
		}
		win.webContents.send("proxyStarted");
	}

	stop() {
		console.log("stop함수에 들어오기는 했니?");
		this.proxy.close();
		console.log("close는 됐나?");
		this.proxy = null;
		console.log("그럼 null은 됐나?");
		win.webContents.send("proxyStopped");
		this.log({ type: "info", source: "proxy", message: "Proxy stopped" });
	}

	getInterfaces() {
		this.addresses = [];
		const interfaces = os.networkInterfaces();
		for (const i in interfaces) {
			for (const j in interfaces[i]) {
				const address = interfaces[i][j];
				if (address.family === "IPv4" && !address.internal) {
					this.addresses.push(address.address);
				}
			}
		}
		return this.addresses;
	}

	isRunning() {
		if (this.proxy) {
			return true;
		}
		return false;
	}

	log(entry) {
		if (!entry) {
			return;
		}

		// add unique id for performance reasons
		entry.id = uuidv4();

		entry.date = new Date().toLocaleTimeString();
		this.logEntries = [entry, ...this.logEntries];

		const maxLogEntries = parseInt(config.Config.App.maxLogEntries) || 0;
		if (this.logEntries.length > maxLogEntries && maxLogEntries !== 0) {
			this.logEntries.pop();
		}

		// win.webContents.send("logupdated", this.logEntries);
		this.logEntries.forEach((log) => console.log(log.message));
	}

	getLogEntries() {
		return this.logEntries;
	}

	clearLogs() {
		this.logEntries = [];
		// win.webContents.send("logupdated", this.logEntries);
		this.logEntries.forEach((log) => console.log(log));
	}
}

module.exports = SWProxy;
