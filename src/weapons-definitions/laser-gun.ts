import type { Weapon } from "../weapon";

/**
 * A high-tech gun that fires energy beams.
 */
export const laserGun: Weapon = {
	id: "laser-gun",
	name: "Laser Gun",
	classes: ["gun", "elemental", "precise"],
	statsBonus: {},
};
