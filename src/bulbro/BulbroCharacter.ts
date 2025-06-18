import type { Weapon } from "../weapon";
import type { SpriteType } from "./Sprite";

/**
 * Statistics for a Bulbro, Player, or Enemy.
 */
export interface Stats {
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
	pickupRange: number;
}

/**
 * Bulbro character model.
 */
export interface Bulbro {
	id: string;
	name: string;
	baseStats: Stats;
	weapons: Weapon[];
}

/** Player controlling a Bulbro. */
export interface Player {
	id: string;
	bulbro: Bulbro;
	sprite: SpriteType;
}
