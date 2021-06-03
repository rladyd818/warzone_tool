//BattleWorldBossStart;
module.exports = {
	userSetting: {},
	init(proxy, userSetting) {
		this.userSetting = userSetting;
		proxy.on("BattleWorldBossStart", (req, resp) => {
			let ret = resp["worldboss_battle_result"];
			let msg = "월드보스 결과\n\n";
			for (key in ret) {
				if (key == "total_battle_point") msg += `${key}: ${ret[key]}\n`;
				if (key == "bonus_battle_point") msg += `${key}: ${ret[key]}\n`;
				if (key == "total_damage") msg += `${key}: ${ret[key]}\n`;
			}
			let nowTime = new Date().toLocaleString();
			proxy.commandList.unshift({
				command: msg,
				time: nowTime,
			});
		});
	},
	updateUserSetting(dungeonMode) {
		return;
	},
};
