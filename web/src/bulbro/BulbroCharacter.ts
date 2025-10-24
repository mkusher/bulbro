import type { Weapon } from "../weapon";
import type { FaceType } from "./sprites/FaceSprite";
import type { StatBonus } from "../game-formulas";

export interface SecondaryStats {
	pickupRange: number;
	knockback: number;
}
export interface MainStats {
	maxHp: number;
	hpRegeneration: number;
	lifeSteal: number;
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

export type WearingItem = "crown" | "medic";

export interface BulbroStyle {
	faceType: FaceType;
	wearingItems: WearingItem[];
}

/**
 * Bulbro character model.
 */
export interface Bulbro {
	id: string;
	name: string;
	statBonuses: StatBonus;
	weapons: Weapon[];
	style: BulbroStyle;
	defaultWeapons: Weapon[];
	availableWeapons: Weapon[];
}
