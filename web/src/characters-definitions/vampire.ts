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
				lifeSteal: 10, // +10 life steal
				rangedDamage: 50, // +50% ranged damage
			},
		style:
			{
				faceType:
					"vampire",
				wearingItems:
					[],
			},
	};
