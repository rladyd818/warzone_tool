import React, { useState, useCallback, useEffect } from "react";
import {
	TextField,
	FormGroup,
	FormControlLabel,
	Checkbox,
} from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";

function Common() {
	const useStyles = makeStyles((theme) => ({
		formGroup: {
			position: "relative",
			width: "100%",
			display: "flex",
			flexDirection: "column",
		},
	}));

	const classes = useStyles();

	const [common, setCommon] = useState(
		window.electronProxy.getUserSetting("common")
	);
	const [checkedA, setCheckedA] = useState(common.enabled);

	const handleChange = useCallback((e) => {
		setCheckedA(e.target.checked);
	});

	const [energy, setEnergy] = useState(common.energy);
	const energyChange = useCallback(
		(e) => {
			setEnergy(e.target.value);
		},
		[energy]
	);
	const [volume, setVolume] = useState(common.volume);
	const volumeChange = useCallback(
		(e) => {
			setVolume(e.target.value);
		},
		[volume]
	);

	useEffect(() => {
		let value = {
			enabled: checkedA,
			energy: Number(energy),
			volume: Number(volume),
		};
		window.electronProxy.updateSetting({
			key: "common",
			value: value,
		});
		setCommon(value);
	}, [energy, checkedA, volume]);

	useEffect(() => {
		window.electronProxy.commonAlarm((args) => {
			if (args.alarm === true) {
				let alarmPath = window.electronProxy.getExtraPath();
				new Audio(`${alarmPath}/alarm6.MP3`).play();
				let _volume = Math.ceil(volume / 10);
				if (_volume > 0 || _volume < 11) audio.volume = _volume;
				else audio.volume = 0.5; // 5 is default

				audio.play();
			}
		});
	}, []);

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
				label="에너지 알람 사용"
			/>
			<TextField
				label="Alarm volume"
				value={volume}
				type="number"
				placeholder={"Set volume level 1 ~ 10"}
				onChange={volumeChange}
			></TextField>
			<TextField
				label="잔량 설정"
				value={energy}
				type="number"
				placeholder={"알림음을 받을 에너지 잔량을 설정하세요."}
				onChange={energyChange}
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

export default Common;
