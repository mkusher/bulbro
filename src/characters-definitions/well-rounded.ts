import type { Bulbro } from "../bulbro";
import { baseHarvesting, baseMaxHp, baseSpeed, baseStats } from "./base";

/**
 * A well-rounded Bulbro character.
 */
export const wellRoundedBulbro: Bulbro = {
	id: "well-rounded",
	name: "Well Rounded",
	baseStats: {
		...baseStats,
		maxHp: baseMaxHp + 5,
		speed: baseSpeed * 1.05,
		harvesting: baseHarvesting + 8,
	},
	weapons: [],
};
