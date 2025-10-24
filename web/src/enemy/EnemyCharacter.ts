import type { EnemyStats } from "../enemy";
import type { Weapon } from "../weapon";
import type { EnemyType } from "./EnemyState";
import { type } from "arktype";

export const EnemyBehaviorsType = type(
	"'default' | 'keeping-distance' | 'rage-running'",
);
/**
 * Character model for an enemy.
 */
export interface EnemyCharacter {
	id: string;
	sprite: EnemyType;
	name: string;
	stats: EnemyStats;
	weapons: Weapon[];
	behaviors?: typeof EnemyBehaviorsType.infer;
}
