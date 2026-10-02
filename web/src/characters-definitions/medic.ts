import type { Bulbro } from "../bulbro";
import {
	fist,
	hand,
	pistol,
} from "../weapons-definitions";
import { baseBulbro } from "./base";

/**
 * A medic Bulbro character specialized in healing and support.
 */
export const medic: Bulbro =
	{
		...baseBulbro,
		id: "medic",
		name: "Medic",
		statBonuses:
			{
				hpRegeneration: 5, // +5 HP regeneration (~0.56 HP/s)
				maxHp: 20, // +20 max HP
				engineering: 3, // +3 engineering
			},
		style:
			{
				faceType:
					"normal",
				wearingItems:
					[
						"medic",
					],
			},
		availableWeapons:
			[
				pistol,
				hand,
				fist,
			],
	};
