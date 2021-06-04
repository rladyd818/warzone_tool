module.exports = {
	userSetting: {},
	energy: 90,
	enabled: true,
	init(proxy, userSetting) {
		this.userSetting = userSetting;
		this.energy = userSetting.common.energy;
		this.enabled = userSetting.common.enabled;

		proxy.on("BattleRiftOfWorldsRaidResult", (req, resp) => {
			if (this.enabled == false) return;
			if (resp["wizard_info"]["wizard_energy"] <= this.energy)
				proxy.commit("commonAlarm");
		});

		proxy.on("BattleDungeonResult_V2", (req, resp) => {
			if (this.enabled == false) return;
			if (resp["wizard_info"]["wizard_energy"] <= this.energy)
				proxy.commit("commonAlarm");
		});
	},
	updateUserSetting(common) {
		this.userSetting.common = common;
		this.energy = Number(common.energy);
		this.enabled = !!common.enabled;
	},
};
