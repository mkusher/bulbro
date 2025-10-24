import type { Bulbro } from "../bulbro";
import { baseBulbro } from "./base";

/**
 * A berserker Bulbro character specialized in melee combat and high damage.
 */
export const berserker: Bulbro = {
	...baseBulbro,
	id: "berserker",
	name: "Berserker",
	statBonuses: {
		meleeDamage: 80, // +80% melee damage
		damage: 20, // +20% damage
		attackSpeed: 30, // +30% attack speed
		maxHp: 5, // +5 HP
		armor: -5, // -5 armor
	},
	style: {
		faceType: "crazy",
		wearingItems: [],
	},
};
