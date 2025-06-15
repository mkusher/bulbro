import type { Weapon } from "../weapon";

/**
 * The most basic orc's gun
 */
export const orcSlowGun: Weapon = {
	id: "orc-gun",
	name: "Orc Very Slow Gun",
	classes: ["gun"],
	shotSpeed: 50,
	statsBonus: {
		range: 3000,
		damage: 10,
	},
};
