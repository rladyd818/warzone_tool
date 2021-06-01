module.exports = {
	userSetting: {},
	count: 1,
	enabled: true,
	init(proxy, userSetting) {
		this.userSetting = userSetting;
		this.count = userSetting.raidMode.count;
		this.enabled = userSetting.raidMode.enabled;

		proxy.on("BattleRiftOfWorldsRaidResult", (req, resp) => {
			if (this.enabled == false) return;
			if (req["auto_repeat"] == this.count) proxy.commit("raidAlarm");
		});
	},
	updateUserSetting(raidMode) {
		this.userSetting.raidMode = raidMode;
		this.count = Number(raidMode.count);
		this.enabled = !!raidMode.enabled;
	},
};
