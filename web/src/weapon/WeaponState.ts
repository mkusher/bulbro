import type { WeaponType } from "@/weapon";
import type { Stats } from "../bulbro";
import type { Direction } from "../geometry";

export type StatsBonus = Partial<Stats>;
/**
 * Runtime state of a single weapon in play.
 */
export interface WeaponState {
	/** Weapon identifier */
	id: string;
	/** Timestamp of the last time this weapon struck */
	lastStrikedAt: number;
	statsBonus: StatsBonus;
	shotSpeed: number;
	type: WeaponType;
	/** Aiming direction for the weapon */
	aimingDirection: Direction;
}
