import type { Weapon } from "../weapon";

/**
 * The most basic unarmed attack.
 */
export const orcFist: Weapon = {
	id: "fist",
	name: "Fist",
	classes: ["unarmed"],
	statsBonus: {
		range: 30,
	},
};
