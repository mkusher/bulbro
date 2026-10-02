import type { Bulbro } from "../bulbro";
import { baseBulbro } from "./base";

/**
 * A cyborg Bulbro character enhanced with technology and advanced weaponry.
 */
export const cyborg: Bulbro =
	{
		...baseBulbro,
		id: "cyborg",
		name: "Cyborg",
		statBonuses:
			{
				maxHp: 10, // +10 max HP
				rangedDamage: 4, // +4 ranged damage
				engineering: 5, // +5 engineering
				attackSpeed: 10, // +10% attack speed
				range: 25, // +25 range
				armor: 1, // +1 armor
			},
		style:
			{
				faceType:
					"cyborg",
				wearingItems:
					[],
			},
	};
