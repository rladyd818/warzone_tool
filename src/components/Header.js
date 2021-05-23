import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import {
	Button,
	TextField,
	Select,
	FormControl,
	InputLabel,
	MenuItem,
	InputBase,
	Icon,
} from "@material-ui/core";
import "../css/Header.css";
import { Rowing } from "@material-ui/icons";

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

	// console.log("proxy상태체크", window.electronProxy.isRunning());
	const [proxyState, setProxyState] = useState(
		window.electronProxy.isRunning()
	);

	const changeProxy = useCallback(() => {
		let state = window.electronProxy.isRunning();
		state
			? window.electronProxy.proxyStop()
			: window.electronProxy.proxyStart();
		setProxyState(state);
	}, [proxyState]);

	// // proxy running상태 change
	useEffect(() => {
		window.electronProxy.onProxyStarted(() => {
			setProxyState(true);
		});

		return () => {
			window.electronProxy.removeProxyStarted();
		};
	}, []);

	useEffect(() => {
		window.electronProxy.onProxyStopped(() => {
			console.log("stopped로 들어왔음", proxyState);
			setProxyState(false);
		});

		return () => {
			window.electronProxy.removeProxyStopped();
		};
	}, []);

	// useEffect(() => {
	// 	return () => {
	// 		ipcRenderer.removeAllListeners("proxyStarted");
	// 		ipcRenderer.removeAllListeners("proxyStopped");
	// 	};
	// }, []);

	const BootstrapInput = withStyles((theme) => ({
		root: {
			"label + &": {
				marginTop: theme.spacing(3),
			},
		},
		input: {
			borderRadius: 4,
			position: "relative",
			backgroundColor: theme.palette.background.paper,
			border: "1px solid #ced4da",
			fontSize: 16,
			padding: "10px 26px 10px 12px",
			transition: theme.transitions.create(["border-color", "box-shadow"]),
			// Use the system font instead of the default Roboto font.
			fontFamily: [
				"-apple-system",
				"BlinkMacSystemFont",
				'"Segoe UI"',
				"Roboto",
				'"Helvetica Neue"',
				"Arial",
				"sans-serif",
				'"Apple Color Emoji"',
				'"Segoe UI Emoji"',
				'"Segoe UI Symbol"',
			].join(","),
			"&:focus": {
				borderRadius: 4,
				borderColor: "#80bdff",
				boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
			},
		},
	}))(InputBase);

	const useStyles = makeStyles((theme) => ({
		margin: {
			margin: theme.spacing(1),
			flexDirection: "row",
			width: "100%",
		},
		common: {
			margin: theme.spacing(1),
			marginLeft: theme.spacing(5),
			marginTop: "16px",
			// width: "100%",
		},
		right: {
			margin: theme.spacing(1),
			// marginLeft: theme.spacing(10),
		},
		label: {
			marginTop: "8px",
		},
	}));

	const interfaces = window.electronProxy
		.proxyGetInterfaces()
		.map((interfaceEntry, i) => ({ key: i, text: interfaceEntry, value: i }));

	const classes = useStyles();
	const [Ip, setIp] = React.useState(interfaces[0].text);
	const handleChange = (event) => {
		setIp(event.target.value);
	};

	const [Port, setPort] = React.useState(3333);
	const handleValue = (event) => {
		setPort(event.target.value);
	};

	return (
		<>
			<div className="header__layout">
				<FormControl className={classes.margin}>
					<InputLabel
						id="demo-customized-select-label3"
						className={classes.label}
					>
						IP
					</InputLabel>
					{/* <h4 className="header__ip">IP:</h4> */}
					{/* <label className="header__ip">IP</label> */}
					<Select
						labelId="demo-customized-select-label"
						id="demo-customized-select"
						value={Ip}
						onChange={handleChange}
						input={<BootstrapInput />}
					>
						{interfaces.map((value) => {
							return <MenuItem value={value.text}>{value.text}</MenuItem>;
						})}
					</Select>
					<TextField
						className={classes.common}
						label="Port"
						value={Port}
						onChange={handleValue}
					></TextField>
					<div className="header__right">
						<Button
							variant="contained"
							color="primary"
							className={classes.right}
							endIcon={<Icon>send</Icon>}
						>
							Get Cert
						</Button>
						<Button
							variant="contained"
							color="primary"
							className={classes.right}
							endIcon={<Icon>send</Icon>}
							onClick={changeProxy}
						>
							{proxyState ? "Proxy Stop" : "Proxy Start"}
						</Button>
					</div>
				</FormControl>
			</div>
			<hr></hr>
		</>
	);
}

export default Header;
