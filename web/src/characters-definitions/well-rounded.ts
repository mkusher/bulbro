import type { Bulbro } from "../bulbro";
import { baseBulbro } from "./base";

/**
 * A well-rounded Bulbro character.
 */
export const wellRoundedBulbro: Bulbro =
	{
		...baseBulbro,
		id: "well-rounded",
		name: "Well Rounded",
		statBonuses:
			{
				maxHp: 5, // +5 max HP
				speed: 5, // +5% speed
				harvesting: 8, // +8 materials and XP at the end of each wave
			},
		style:
			{
				faceType:
					"normal",
				wearingItems:
					[],
			},
	};
