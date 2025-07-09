import type { Weapon } from "../weapon";

export interface SecondaryStats {
	pickupRange: number;
	knockback: number;
}
export interface MainStats {
	maxHp: number;
	hpRegeneration: number;
	damage: number;
	meleeDamage: number;
	rangedDamage: number;
	elementalDamage: number;
	attackSpeed: number;
	critChance: number;
	engineering: number;
	range: number;
	armor: number;
	dodge: number;
	speed: number;
	luck: number;
	harvesting: number;
}
export interface Stats extends MainStats, SecondaryStats {}

/**
 * Bulbro character model.
 */
export interface Bulbro {
	id: string;
	name: string;
	baseStats: Stats;
	weapons: Weapon[];
}
