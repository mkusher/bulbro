import type { Bulbro } from "../bulbro";
import { baseBulbro } from "./base";

/**
 * An evil Bulbro character specialized in dark magic and aggressive combat.
 */
export const evil: Bulbro =
	{
		...baseBulbro,
		id: "evil",
		name: "Evil",
		statBonuses:
			{
				damage: 60, // +60% damage
				meleeDamage: 6, // +6 melee damage
				critChance: 15, // +15% crit chance
				attackSpeed: 25, // +25% attack speed
				maxHp:
					-5, // -5 max HP
				armor:
					-3, // -3 armor
				speed: 10, // +10% speed
			},
		style:
			{
				faceType:
					"evil",
				wearingItems:
					[],
			},
	};
