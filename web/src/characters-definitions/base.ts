export { baseStats } from "@/game-formulas";

import type { Bulbro } from "@/bulbro";
import { weapons } from "@/weapons-definitions";

export const baseBulbro: Bulbro =
	{
		id: "base",
		name: " Base",
		statBonuses:
			{},
		weapons:
			[],
		style:
			{
				faceType:
					"normal",
				wearingItems:
					[],
			},
		excludedStartingWeapons:
			[
				"ak47",
				"bazooka",
			],
		defaultWeapons:
			[],
		availableWeapons:
			[
				...weapons,
			],
	};
