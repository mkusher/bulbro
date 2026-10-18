import type { WeaponType } from "@/weapon";
import type { Direction } from "../geometry";
import type { MeleeStrike } from "./MeleeStrike";

/** Damage stats a weapon can scale with. */
export type DamageScalingStat =
	| "meleeDamage"
	| "rangedDamage"
	| "elementalDamage"
	| "engineering";

/**
 * Weapon's own stats. They are not stat points of the wielder:
 * the wielder's stats are applied on top of them by the combat formulas.
 */
export type WeaponStats =
	{
		/** Projectiles per attack (default 1). Damage and scaling apply per projectile. */
		projectiles?: number;
		/** Spread between the outermost projectiles in radians. */
		spread?: number;
		/** Harvesting granted while this weapon is equipped. */
		harvesting?: number;
		/** Base damage of a single attack */
		damage?: number;
		/** Seconds between attacks before the wielder's attack speed is applied */
		cooldown?: number;
		/**
		 * Attacks before the weapon has to reload. Unlimited when missing.
		 * After the last one the weapon waits `reload` instead of `cooldown`.
		 */
		magazine?: number;
		/**
		 * Seconds to reload an empty magazine before the wielder's attack
		 * speed is applied. Used only with `magazine`.
		 */
		reload?: number;
		/** Attack reach added to the wielder's range */
		range?: number;
		/** Knockback strength added to the wielder's knockback */
		knockback?: number;
		/** Crit chance (%) added to the wielder's crit chance */
		critChance?: number;
		/**
		 * Radius of the explosion of the weapon's projectiles, before the
		 * wielder's explosion size is applied. Used by "explosion" attacks.
		 */
		explosionRadius?: number;
		/** Damage multiplier of a critical hit (default 2) */
		critMultiplier?: number;
		/**
		 * Share of each wielder damage stat added to the weapon damage (1 = 100%).
		 * Defaults to 100% melee damage for melee weapons and 100% ranged damage for guns.
		 */
		scaling?: Partial<
			Record<
				DamageScalingStat,
				number
			>
		>;
	};

/** Weapon tiers I–IV, as in Brotato. Two equal weapons combine into the next tier. */
export type WeaponTier =
	| 1
	| 2
	| 3
	| 4;

/**
 * Runtime state of a single weapon in play.
 */
export interface WeaponState {
	/** Weapon identifier */
	id: string;
	/** Timestamp of the last time this weapon struck */
	lastStrikedAt: number;
	/** Stats of the weapon at its tier */
	statsBonus: WeaponStats;
	shotSpeed: number;
	type: WeaponType;
	/** Weapon tier, I when missing */
	tier?: WeaponTier;
	/** Aiming direction for the weapon */
	aimingDirection: Direction;
	/** Attacks made since the last reload, for weapons with a magazine */
	shotsFired?: number;
	/** Last melee strike of this weapon, if it strikes instead of shooting */
	strike?: MeleeStrike;
}
