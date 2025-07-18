import type { Stats } from "./bulbro";
import type { WeaponState } from "./currentState";
import { fist, weapons } from "./weapons-definitions";

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
	lastStrikedAt: 0,
	statsBonus: w.statsBonus,
	shotSpeed: w.shotSpeed,
});

export const fromWeaponState = (state: WeaponState) =>
	weapons.find((w) => w.id === state.id) ?? fist;
