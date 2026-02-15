import type { Stats } from "./bulbro";
import { zeroPoint } from "./geometry";
import { uuid } from "./uuid";
import type { WeaponState } from "./weapon/WeaponState";
import {
	enemyWeapons,
	fist,
	weapons,
} from "./weapons-definitions";

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
	| "aphidGun";

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
export type StatsBonus =
	Partial<Stats>;

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

export const toWeaponState =
	(
		w: Weapon,
	): WeaponState => ({
		id: uuid(),
		lastStrikedAt: 0,
		statsBonus:
			w.statsBonus,
		shotSpeed:
			w.shotSpeed,
		type: w.id,
		aimingDirection:
			{
				x: 1,
				y: 0,
			},
	});

export const fromWeaponState =
	(
		state: WeaponState,
	) =>
		weapons.find(
			(
				w,
			) =>
				w.id ===
				state.type,
		) ??
		enemyWeapons.find(
			(
				w,
			) =>
				w.id ===
				state.type,
		) ??
		fist;

export const getWeaponByType =
	(
		type: WeaponType,
	): Weapon =>
		weapons.find(
			(
				w,
			) =>
				w.id ===
				type,
		) ??
		enemyWeapons.find(
			(
				w,
			) =>
				w.id ===
				type,
		) ??
		fist;

export const isUnarmedWeapon =
	(
		type: WeaponType,
	): boolean =>
		getWeaponByType(
			type,
		).classes.includes(
			"unarmed",
		);
