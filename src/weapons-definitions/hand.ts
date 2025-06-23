import type { Weapon } from "../weapon";

/**
 * A simple tool-like weapon: the hand.
 */
export const hand: Weapon = {
	id: "hand",
	name: "Hand",
	classes: ["support"],
	shotSpeed: 1000,
	statsBonus: {
		damage: 1,
		range: 150,
		knockback: 30,
		attackSpeed: 1.01,
	},
};
