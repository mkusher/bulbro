import type { Weapon } from "../weapon";

/**
 * A rapid-fire submachine gun.
 */
export const smg: Weapon = {
	id: "smg",
	name: "SMG",
	classes: ["gun", "support"],
	statsBonus: {},
};
