import React, { useState, useEffect } from "react";
import "./Main.css";

function Top() {
	const [commands, setCommands] = useState([]);
	useEffect(() => {
		window.electronProxy.onCommand((args) => {
			// console.log("onCommand에 들어왔음", args);
			setCommands(args);
		});
	}, []);

	return (
		<div>
			<h1 style={{ textAlign: "center", marginTop: "8px" }}>
				Warzone Exporter
			</h1>
			<div style={{ width: "100%", overflow: "hidden", height: "80%" }}>
				{commands.map((command) => {
					return (
						<>
							<hr></hr>
							{new Date().toLocaleString()}
							<h3
								style={{
									textAlign: "center",
									color: "gray",
									marginTop: "10px",
								}}
							>
								{command}
							</h3>
						</>
					);
				})}
			</div>
		</div>
	);
}

export default Top;
