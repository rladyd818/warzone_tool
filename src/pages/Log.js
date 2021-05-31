import React, { useState, useEffect } from "react";
import "../css/Main.css";

function Log() {
	const [commands, setCommands] = useState([{ command: "", time: "" }]);
	useEffect(() => {
		window.electronProxy.onCommand((args) => {
			setCommands(args);
		});
	}, []);

	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					width: "100%",
					overflow: "scroll",
					height: "100%",
					flex: 1,
					flexDirection: "column",
				}}
			>
				{commands.map((command, idx) => {
					return (
						<div key={{ idx }}>
							<hr></hr>
							<h5 style={{ marginLeft: "8px" }}>{command.time}</h5>
							<h3
								style={{
									textAlign: "center",
									color: "gray",
									marginTop: "10px",
								}}
							>
								{command.command}
							</h3>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default Log;
