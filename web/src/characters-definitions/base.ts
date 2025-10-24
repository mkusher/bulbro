export { baseStats } from "@/game-formulas";
import type { Bulbro } from "@/bulbro";
import { weapons } from "@/weapons-definitions";

export const baseBulbro: Bulbro = {
	id: "base" as any,
	name: " Base",
	statBonuses: {},
	weapons: [],
	style: {
		faceType: "normal",
		wearingItems: [],
	},
	defaultWeapons: [],
	availableWeapons: [...weapons],
};
