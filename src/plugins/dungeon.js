module.exports = {
	userSetting: {},
	count: 1,
	enabled: true,
	init(proxy, userSetting) {
		this.userSetting = userSetting;
		this.count = userSetting.dungeonMode.count;
		this.enabled = userSetting.dungeonMode.enabled;
		proxy.on("BattleDungeonResult_V2", (req, resp) => {
			// BattleDungeonResult_V2
			if (this.enabled == false) return;
			if (req["auto_repeat"] == this.count) proxy.commit("dungeonAlarm");
		});
	},
	updateUserSetting(dungeonMode) {
		this.userSetting.dungeonMode = dungeonMode;
		this.count = Number(dungeonMode.count);
		this.enabled = !!dungeonMode.enabled;
	},
};
