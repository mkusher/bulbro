import type { WeaponType } from "@/weapon";
import type { Stats } from "../bulbro";
import type { Direction } from "../geometry";
import type { MeleeStrike } from "./MeleeStrike";

export type StatsBonus =
	Partial<Stats>;
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
	/** Last melee strike of this weapon, if it strikes instead of shooting */
	strike?: MeleeStrike;
}
