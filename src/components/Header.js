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
	const [proxyState, setProxyState] = useState(
		window.electronProxy.isRunning()
	);

	const copyCert = useCallback(() => {
		window.electronProxy.getCert();
	}, []);

	const changeProxy = useCallback(() => {
		let state = window.electronProxy.isRunning();
		if (state) window.electronProxy.proxyStop();
		else window.electronProxy.proxyStart();

		setProxyState(window.electronProxy.isRunning());
	}, [proxyState]);

	// // proxy running상태 change
	useEffect(() => {
		window.electronProxy.onProxyStarted(() => {});

		return () => {
			window.electronProxy.removeProxyStarted();
		};
	}, []);

	useEffect(() => {
		window.electronProxy.onProxyStopped(() => {});

		return () => {
			window.electronProxy.removeProxyStopped();
		};
	}, []);

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

	const [Port, setPort] = React.useState(8080);
	const handleValue = (e) => {
		const port = e.target.value;
		setPort(port);
		window.electronProxy.updatePort(port);
	};

	const alarm = useCallback(() => {
		let alarmPath = window.electronProxy.getAlarmPath();
		console.log(alarmPath);
		new Audio(`${alarmPath}/bell.MP3`).play();
	}, []);
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
							onClick={copyCert}
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
			<Button color="primary" onClick={alarm}>
				알람테스트
			</Button>
			<hr></hr>
		</>
	);
}

export default Header;
