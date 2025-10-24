import type { Bulbro } from "../bulbro";
import { baseBulbro } from "./base";

/**
 * An evil Bulbro character specialized in dark magic and aggressive combat.
 */
export const evil: Bulbro = {
	...baseBulbro,
	id: "evil",
	name: "Evil",
	statBonuses: {
		damage: 60, // +60% damage
		meleeDamage: 80, // +80% melee damage
		critChance: 100, // +100% crit chance (2x)
		attackSpeed: 50, // +50% attack speed
		maxHp: -5, // -5 HP
		armor: -3, // -3 armor
		speed: 10, // +10% speed
	},
	style: {
		faceType: "evil",
		wearingItems: [],
	},
};
