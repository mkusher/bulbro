import type { WeaponType } from "@/weapon";
import type { Direction } from "../geometry";
import type { MeleeStrike } from "./MeleeStrike";

/** Damage stats a weapon can scale with. */
export type DamageScalingStat =
	| "meleeDamage"
	| "rangedDamage"
	| "elementalDamage";

/**
 * Weapon's own stats. They are not stat points of the wielder:
 * the wielder's stats are applied on top of them by the combat formulas.
 */
export type WeaponStats =
	{
		/** Base damage of a single attack */
		damage?: number;
		/** Seconds between attacks before the wielder's attack speed is applied */
		cooldown?: number;
		/** Attack reach added to the wielder's range */
		range?: number;
		/** Knockback strength added to the wielder's knockback */
		knockback?: number;
		/** Crit chance (%) added to the wielder's crit chance */
		critChance?: number;
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

/**
 * Runtime state of a single weapon in play.
 */
export interface WeaponState {
	/** Weapon identifier */
	id: string;
	/** Timestamp of the last time this weapon struck */
	lastStrikedAt: number;
	statsBonus: WeaponStats;
	shotSpeed: number;
	type: WeaponType;
	/** Aiming direction for the weapon */
	aimingDirection: Direction;
	/** Last melee strike of this weapon, if it strikes instead of shooting */
	strike?: MeleeStrike;
}
