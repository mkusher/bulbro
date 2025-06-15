import type { Weapon } from "../weapon";

/**
 * A powerful but slow two-shot shotgun.
 */
export const doubleBarrelShotgun: Weapon = {
	id: "double-barrel-shotgun",
	name: "Double Barrel Shotgun",
	classes: ["gun", "heavy", "explosive"],
	shotSpeed: 2500,
	statsBonus: {
		damage: 12,
		attackSpeed: 1.37,
		range: 350,
	},
};
