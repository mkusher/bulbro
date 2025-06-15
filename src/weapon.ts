import type { Stats } from "./bulbro";

/**
 * Weapon classes.
 */
export type WeaponClass =
	| "blade"
	| "blunt"
	| "elemental"
	| "explosive"
	| "gun"
	| "heavy"
	| "precise"
	| "support"
	| "tool"
	| "unarmed";

/**
 * Partial stats bonuses that weapons can provide.
 */
export type StatsBonus = Partial<Stats>;

/**
 * Weapon model.
 */
export interface Weapon {
	id: string;
	name: string;
	classes: WeaponClass[];
	statsBonus: StatsBonus;
	shotSpeed: number;
}

export const toWeaponState = (w: Weapon) => ({
	id: w.id,
	lastStrikedAt: new Date(0),
	statsBonus: w.statsBonus,
	shotSpeed: w.shotSpeed,
});
