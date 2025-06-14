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
}
