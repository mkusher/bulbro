import type { Stats } from "./bulbro";
import { uuid } from "./uuid";
import type { WeaponState } from "./weapon/WeaponState";
import { fist, weapons } from "./weapons-definitions";
import { zeroPoint } from "./geometry";

export type WeaponType =
	| "hand"
	| "fist"
	| "pistol"
	| "smg"
	| "ak47"
	| "doubleBarrelShotgun"
	| "knife"
	| "sword"
	| "laserGun"
	| "brick"
	| "orcGun"
	| "enemyFist"
	| "enemyGun";

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
	id: WeaponType;
	name: string;
	classes: WeaponClass[];
	statsBonus: StatsBonus;
	shotSpeed: number;
}

export const toWeaponState = (w: Weapon): WeaponState => ({
	id: uuid(),
	lastStrikedAt: 0,
	statsBonus: w.statsBonus,
	shotSpeed: w.shotSpeed,
	type: w.id,
	aimingDirection: zeroPoint(),
});

export const fromWeaponState = (state: WeaponState) =>
	weapons.find((w) => w.id === state.type) ?? fist;
