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
	const [volume, setVolume] = useState(raidMode.volume);
	const volumeChange = useCallback(
		(e) => {
			setVolume(e.target.value);
		},
		[volume]
	);

	useEffect(() => {
		let value = { enabled: checkedA, count: count, volume: volume };
		window.electronProxy.updateSetting({
			key: "raidMode",
			value: value,
		});
		setRaidMode(value);
	}, [count, checkedA, volume]);

	useEffect(() => {
		window.electronProxy.raidAlarm((args) => {
			if (args.alarm === true) {
				alarm();
			}
		});
	}, []);
	// 던전 알람
	const alarm = useCallback(() => {
		let alarmPath = window.electronProxy.getExtraPath();
		new Audio(`${alarmPath}/alarm10.MP3`).play();
		let _volume = Math.ceil(volume / 10);
		if (_volume > 0 || _volume < 11) audio.volume = _volume;
		else audio.volume = 5; // 5 is default

		audio.play();
	}, [volume]);

	return (
		<FormGroup row className={classes.formGroup}>
			<FormControlLabel
				control={
					<Checkbox
						checked={checkedA}
						onChange={handleChange}
						name="checkedA"
						color="Secondary"
					/>
				}
				label="레이드알림 사용"
			/>
			<TextField
				label="Alarm volume"
				value={volume}
				type="number"
				placeholder={"Set volume level 1 ~ 10"}
				onChange={volumeChange}
			></TextField>
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
