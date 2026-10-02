import type { Bulbro } from "../bulbro";
import { baseBulbro } from "./base";

/**
 * A ranger Bulbro character specialized in ranged combat.
 */
export const vampire: Bulbro =
	{
		...baseBulbro,
		id: "vampire",
		name: "Vampire",
		statBonuses:
			{
				range: 50, // +50 range
				lifeSteal: 10, // 10% chance to heal 1 HP on hit
				rangedDamage: 3, // +3 ranged damage
			},
		style:
			{
				faceType:
					"vampire",
				wearingItems:
					[],
			},
	};
