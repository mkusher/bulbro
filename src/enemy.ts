import type { Stats } from "./bulbro";
import type { Size } from "./geometry";

/**
 * Character model for an enemy.
 */
export interface EnemyCharacter {
	id: string;
	name: string;
	baseStats: Stats;
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
