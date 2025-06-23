import type { Weapon } from "../weapon";

/**
 * The most basic unarmed attack.
 */
export const orcFist: Weapon = {
	id: "fist",
	name: "Fist",
	classes: ["unarmed"],
	shotSpeed: 1000,
	statsBonus: {
		range: 30,
		damage: 2,
	},
};
