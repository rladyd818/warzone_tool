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
	const [dungeonMode, setDungeonMode] = useState(
		window.electronProxy.getUserSetting("dungeonMode")
	);
	console.log("던전모드", dungeonMode);
	// using alarm
	const [checkedA, setCheckedA] = useState(dungeonMode.enabled);
	const handleChange = useCallback((e) => {
		setCheckedA(e.target.checked);
	});

	// using dungeon record
	// const [checkedB, setCheckedB] = useState(dungeonMode.record);
	// const handleChange = useCallback((e) => {
	// 	setCheckedA(e.target.checked);
	// });

	const [count, setCount] = useState(dungeonMode.count);
	const countChange = useCallback(
		(e) => {
			setCount(e.target.value);
		},
		[count]
	);

	const [volume, setVolume] = useState(dungeonMode.volume);
	const volumeChange = useCallback(
		(e) => {
			console.log(e.target.value);
			setVolume(e.target.value);
		},
		[volume]
	);

	useEffect(() => {
		let value = {
			enabled: checkedA,
			count: Number(count),
			volume: Number(volume),
		};
		window.electronProxy.updateSetting({
			key: "dungeonMode",
			value: value,
		});
		setDungeonMode(value);
	}, [count, checkedA, volume]);

	// useEffect(() => {
	window.electronProxy.dungeonAlarm((args) => {
		console.log("프론트에 던전알람 들어옴", args);
		if (args.alarm === true) {
			let alarmPath = window.electronProxy.getExtraPath();
			let audio = new Audio(`${alarmPath}/bell.MP3`);
			let _volume = (volume / 10).toFixed(1);
			console.log(volume);
			console.log(_volume);
			if (_volume > 0 || _volume < 11) audio.volume = _volume;
			else audio.volume = 0.5; // 0.5 is default

			audio.play();
		}
	});
	// }, []);

	// 던전 알람
	// const alarm = useCallback(() => {
	// 	let alarmPath = window.electronProxy.getExtraPath();
	// 	let audio = new Audio(`${alarmPath}/bell.MP3`);
	// 	let _volume = (volume / 10).toFixed(1);
	// 	console.log(volume);
	// 	console.log(_volume);
	// 	if (_volume > 0 || _volume < 11) audio.volume = _volume;
	// 	else audio.volume = 0.5; // 0.5 is default

	// 	audio.play();
	// }, [volume]);

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

export default Dungeon;
