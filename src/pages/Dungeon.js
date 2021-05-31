import React, { useState, useCallback, useEffect } from "react";
import {
	TextField,
	FormGroup,
	FormControlLabel,
	Checkbox,
} from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";

function Dungeon() {
	const useStyles = makeStyles((theme) => ({
		formGroup: {
			position: "relative",
			width: "100%",
			display: "flex",
			flexDirection: "column",
		},
	}));

	const classes = useStyles();

	// const [state, setState] = React.useState({
	// 	checkedA: true,
	// 	checkedB: true,
	// 	checkedF: true,
	// 	checkedG: true,
	// });

	// const handleChange = (event) => {
	// 	setState({ ...state, [event.target.name]: event.target.checked });
	// };

	const [checkedA, setCheckedA] = useState(true);

	const handleChange = (e) => {
		setCheckedA(e.target.checked);
	};

	const [count, setCount] = useState(9);
	const countChange = useCallback(
		(e) => {
			setCount(e.target.value);
			window.electronProxy.updateSetting({
				key: "dungeonMode",
				value: { enabled: checkedA, count: e.target.value },
			});
		},
		[count]
	);

	useEffect(() => {
		window.electronProxy.dungeonAlarm((args) => {
			console.log("args들어옴", args);
			if (args.alarm === true) {
				alarm();
			}
		});
	}, []);
	// 던전 알람
	const alarm = useCallback(() => {
		let alarmPath = window.electronProxy.getExtraPath();
		console.log(alarmPath);
		new Audio(`${alarmPath}/bell.MP3`).play();
	}, []);

	return (
		<FormGroup row className={classes.formGroup}>
			<FormControlLabel
				control={
					<Checkbox
						// checked={state.checkedB}
						checked={checkedA}
						onChange={handleChange}
						name="checkedA"
						color="Secondary"
					/>
				}
				label="던전알림 사용"
			/>
			<TextField
				label="회차 설정"
				value={count}
				type="number"
				placeholder={"알림음을 받을 회차를 설정하세요."}
				onChange={countChange}
			></TextField>
			{/* <FormControlLabel
				control={
					<Checkbox
						checked={state.checkedB}
						onChange={handleChange}
						name="checkedB"
						color="Secondary"
					/>
				}
				label="Primary"
			/> */}
		</FormGroup>
	);
}

export default Dungeon;
