import { zeroPoint } from "./geometry";
import { uuid } from "./uuid";
import type {
	WeaponState,
	WeaponStats,
} from "./weapon/WeaponState";
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
	| "flareGun"
	| "grenade"
	| "machineGun"
	| "bazooka"
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
 * Melee swing: the weapon sweeps an arc around its owner.
 */
export type SwingStrikeConfig =
	{
		type: "swing";
		/** Swept angle in degrees */
		arc: number;
		/** Duration of the sweep in ms */
		duration: number;
	};

/**
 * Melee thrust: the weapon lunges straight at the target and pulls back.
 */
export type ThrustStrikeConfig =
	{
		type: "thrust";
		/** Duration of the lunge (out and back) in ms */
		duration: number;
	};

/**
 * A single melee strike.
 */
export type SingleStrikeConfig =
	| SwingStrikeConfig
	| ThrustStrikeConfig;

/**
 * Melee combo: consecutive attacks cycle through the listed strikes.
 */
export type ComboStrikeConfig =
	{
		type: "combo";
		strikes: SingleStrikeConfig[];
	};

/**
 * How a melee weapon strikes.
 */
export type StrikeConfig =
	| SingleStrikeConfig
	| ComboStrikeConfig;

/**
 * Ranged attack: the weapon fires a projectile flying at `shotSpeed`.
 */
export type ShotAttackConfig =
	{
		type: "shot";
	};

/**
 * How a weapon attacks: fires a projectile or strikes in melee.
 */
export type AttackConfig =
	| ShotAttackConfig
	| StrikeConfig;

/**
 * Weapon model.
 */
export interface Weapon {
	id: WeaponType;
	name: string;
	classes: WeaponClass[];
	statsBonus: WeaponStats;
	shotSpeed: number;
	basePrice: number;
	attack: AttackConfig;
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

/** Whether the weapon strikes in melee instead of firing projectiles. */
export const isMeleeWeapon =
	(
		type: WeaponType,
	): boolean =>
		getWeaponByType(
			type,
		)
			.attack
			.type !==
		"shot";
