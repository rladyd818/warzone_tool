import React from "react";
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

function Header(props) {
	const {
		Ip,
		Port,
		interfaces,
		proxyState,
		alarm,
		handleValue,
		handleChange,
		changeProxy,
		copyCert,
	} = props;
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
			marginTop: theme.spacing(2),
		},
		right: {
			margin: theme.spacing(1),
		},
		label: {
			marginTop: theme.spacing(1),
		},
	}));

	const classes = useStyles();
	return (
		<div>
			<div className="header__layout">
				<div style={{ display: "flex" }}>
					<h1 style={{ marginTop: "8px" }}>Warzone Exporter</h1>
					<FormControl className={classes.margin}>
						<InputLabel
							id="demo-customized-select-label3"
							className={classes.label}
						>
							IP
						</InputLabel>
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
			</div>
			<Button color="primary" onClick={alarm}>
				알람테스트
			</Button>
			<hr></hr>
		</div>
	);
}

export default Header;
