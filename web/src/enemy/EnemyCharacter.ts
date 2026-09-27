import { type } from "arktype";
import type { EnemyStats } from "../enemy";
import type { Weapon } from "../weapon";
import type { EnemyType } from "./EnemyState";

export const EnemyBehaviorsType =
	type(
		"'chasing' | 'keeping-distance' | 'rage-running' | 'stationary'",
	);
/**
 * Character model for an enemy.
 */
export interface EnemyCharacter {
	id: string;
	sprite: EnemyType;
	name: string;
	stats: EnemyStats;
	waveIncreaseStats: Partial<EnemyStats>;
	weapons: Weapon[];
	/** Chance (0..1) to drop a consumable on death */
	consumableDropChance: number;
	behaviors?: typeof EnemyBehaviorsType.infer;
}
