import type { Stats } from "./bulbro";
import type { EnemyState } from "./currentState";
import type { Size, Position } from "./geometry";
import type { Weapon } from "./weapon";

export type EnemyStats = Omit<Stats, "harvesting" | "engineering" | "luck">;

/**
 * Character model for an enemy.
 */
export interface EnemyCharacter {
	id: string;
	name: string;
	stats: EnemyStats;
	weapons: Weapon[];
}

/**
 * Runtime representation of an enemy in-game.
 */
/**
 * Runtime representation of an enemy in-game.
 */
export interface Enemy {
	id: string;
	character: EnemyCharacter;
}

/** Render size for enemy sprites. */
export const ENEMY_SIZE: Size = { width: 16, height: 16 };

export function toEnemyState(
	id: string,
	position: Position,
	enemy: EnemyCharacter,
): EnemyState {
	return {
		...enemy,
		id,
		position,
		healthPoints: enemy.stats.maxHp,
		lastMovedAt: new Date(),
		lastHitAt: new Date(0),
		weapons: enemy.weapons.map((w) => ({
			id: w.id,
			lastStrikedAt: new Date(0), // Initialize to epoch,
			statsBonus: w.statsBonus,
		})),
	};
}
