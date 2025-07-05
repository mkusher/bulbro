import type { EnemyState } from "../enemy";
import type { Position } from "../geometry";

export type SpawningEnemy = {
	type: "spawning-enemy";
	id: string;
	position: Position;
	startedAt: Date;
	duration: number;
	enemy: EnemyState;
};
