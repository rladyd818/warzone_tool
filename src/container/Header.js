import React, { useState, useEffect, useCallback } from "react";
import HeaderComp from "../components/Header";

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
		window.electronProxy.onProxyStopped(() => {});

		return () => {
			window.electronProxy.removeProxyStarted();
			window.electronProxy.removeProxyStopped();
		};
	}, []);

	// useEffect(() => {
	// 	window.electronProxy.onProxyStopped(() => {});

	// 	return () => {
	// 		window.electronProxy.removeProxyStopped();
	// 	};
	// }, []);

	const interfaces = window.electronProxy
		.proxyGetInterfaces()
		.map((interfaceEntry, i) => ({ key: i, text: interfaceEntry, value: i }));

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
		<HeaderComp
			Ip={Ip}
			Port={Port}
			interfaces={interfaces}
			proxyState={proxyState}
			alarm={alarm}
			handleValue={handleValue}
			handleChange={handleChange}
			changeProxy={changeProxy}
			copyCert={copyCert}
		/>
	);
}

export default Header;
