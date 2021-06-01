import React, { useState, useCallback, useEffect } from "react";
import {
	TextField,
	FormGroup,
	FormControlLabel,
	Checkbox,
} from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";

function Raid() {
	const useStyles = makeStyles((theme) => ({
		formGroup: {
			position: "relative",
			width: "100%",
			display: "flex",
			flexDirection: "column",
		},
	}));

	const classes = useStyles();

	const [raidMode, setRaidMode] = useState(
		window.electronProxy.getUserSetting("raidMode")
	);
	const [checkedA, setCheckedA] = useState(raidMode.enabled);

	const handleChange = useCallback((e) => {
		setCheckedA(e.target.checked);
	});

	const [count, setCount] = useState(raidMode.count);
	const countChange = useCallback(
		(e) => {
			setCount(e.target.value);
		},
		[count]
	);

	useEffect(() => {
		console.log("raid에 updateSetting들어옴");
		window.electronProxy.updateSetting({
			key: "raidMode",
			value: { enabled: checkedA, count: count },
		});
		setRaidMode({ enabled: checkedA, count: count });
	}, [count, checkedA]);

	useEffect(() => {
		window.electronProxy.raidAlarm((args) => {
			console.log("raid에 args들어옴", args);
			if (args.alarm === true) {
				alarm();
			}
		});
	}, []);
	// 던전 알람
	const alarm = useCallback(() => {
		let alarmPath = window.electronProxy.getExtraPath();
		console.log(alarmPath);
		new Audio(`${alarmPath}/alarm10.MP3`).play();
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
				label="레이드알림 사용"
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

export default Raid;
