import type { EnemyStats } from "../enemy";
import type { Weapon } from "../weapon";

/**
 * Character model for an enemy.
 */
export interface EnemyCharacter {
	id: string;
	name: string;
	stats: EnemyStats;
	weapons: Weapon[];
}
