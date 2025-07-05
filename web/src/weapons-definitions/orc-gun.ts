import type { Weapon } from "../weapon";

/**
 * The most basic orc's gun
 */
export const orcSlowGun: Weapon = {
	id: "orc-gun",
	name: "Orc Very Slow Gun",
	classes: ["gun"],
	shotSpeed: 250,
	statsBonus: {
		range: 2000,
		damage: 5,
	},
};
