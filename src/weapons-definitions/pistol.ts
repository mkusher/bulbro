import type { Weapon } from "../weapon";

/**
 * A standard one-handed firearm.
 */
export const pistol: Weapon = {
	id: "pistol",
	name: "Pistol",
	classes: ["gun", "precise"],
	statsBonus: {
		damage: 12,
		range: 400,
		attackSpeed: 1.2,
	},
};
