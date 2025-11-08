import type { Bulbro } from "../bulbro";
import { baseBulbro } from "./base";

/**
 * A king Bulbro character with royal attributes and leadership abilities.
 */
export const king: Bulbro =
	{
		...baseBulbro,
		id: "king",
		name: "King",
		statBonuses:
			{
				maxHp: 30, // +30 HP
				damage: 30, // +30% damage
				armor: 10, // +10 armor
				luck: 50, // +50% luck
				pickupRange: 30, // +30% pickup range
			},
		style:
			{
				faceType:
					"normal",
				wearingItems:
					[],
			},
	};
