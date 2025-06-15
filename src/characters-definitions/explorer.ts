import type { Bulbro } from "../bulbro";
import { baseStats } from "./base";

/**
 * A well-rounded Bulbro character.
 */
export const explorer: Bulbro = {
	id: "explorer",
	name: "Explorer",
	baseStats: {
		...baseStats,
		speed: baseStats.speed * 1.1,
		pickupRange: baseStats.pickupRange * 1.5,
	},
	weapons: [],
};
