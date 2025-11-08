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
				maxHp: 10, // +15 HP
				rangedDamage: 20, // +100% ranged damage (2x)
				engineering: 5, // +150% engineering (2.5x)
				attackSpeed: 4, // +40% attack speed
				range: 5, // +75 range
				armor: 1, // +5 armor
			},
		style:
			{
				faceType:
					"cyborg",
				wearingItems:
					[],
			},
	};
