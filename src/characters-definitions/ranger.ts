import type { Bulbro } from "../bulbro";
import { pistol } from "../weapons-definitions";
import { baseStats } from "./base";

/**
 * A well-rounded Bulbro character.
 */
export const ranger: Bulbro = {
	id: "ranger",
	name: "Ranger",
	baseStats: {
		...baseStats,
		range: baseStats.range + 50,
		rangedDamage: baseStats.rangedDamage * 1.5,
	},
	weapons: [pistol],
};
