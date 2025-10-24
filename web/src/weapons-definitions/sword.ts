import type { Weapon } from "../weapon";

/**
 * A sharp blade weapon.
 */
export const sword: Weapon = {
	id: "sword",
	name: "Sword",
	classes: ["blade", "precise"],
	shotSpeed: 800,
	statsBonus: {
		damage: 25,
		meleeDamage: 15,
		range: 80,
		attackSpeed: 0.9,
	},
};
