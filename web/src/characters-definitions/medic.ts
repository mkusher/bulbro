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
				hpRegeneration: 100, // +100% HP regen (2x)
				maxHp: 20, // +20 HP
				engineering: 30, // +30% engineering
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
