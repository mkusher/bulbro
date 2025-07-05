import type { EnemyStats } from "../enemy";
import type { Weapon } from "../weapon";
import type { EnemyType } from "./EnemyState";

/**
 * Character model for an enemy.
 */
export interface EnemyCharacter {
	id: string;
	sprite: EnemyType;
	name: string;
	stats: EnemyStats;
	weapons: Weapon[];
}
