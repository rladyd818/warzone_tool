module.exports = {
	userSetting: {},
	count: 1,
	init(proxy, userSetting) {
		this.userSetting = userSetting;
		this.count = userSetting.dungeonMode.count;
		proxy.on("BattleDungeonResult_V2", (req, resp) => {
			// BattleDungeonResult_V2
			if (req["auto_repeat"] == this.count) proxy.commit("dungeonAlarm");
		});

		proxy.on("BattleRiftOfWorldsRaidResult", (req, resp) => {
			if (req["auto_repeat"] == this.count) proxy.commit("dungeonAlarm");
		});
	},
	updateUserSetting(dungeonMode) {
		this.userSetting.dungeonMode = dungeonMode;
		this.count = Number(dungeonMode.count);
	},
};
