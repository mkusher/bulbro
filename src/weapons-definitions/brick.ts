import type { Weapon } from "../weapon";

/**
 * A heavy blunt weapon: a brick.
 */
export const brick: Weapon = {
	id: "brick",
	name: "Brick",
	classes: ["blunt", "heavy"],
	shotSpeed: 1000,
	statsBonus: {},
};
