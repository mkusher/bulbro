import type { Weapon } from "../weapon";

/**
 * A simple tool-like weapon: the hand.
 */
export const hand: Weapon = {
	id: "hand",
	name: "Hand",
	classes: ["support"],
	shotSpeed: 650,
	statsBonus: {},
};
