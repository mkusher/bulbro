import type { EnemyState } from "../enemy";
import type { Position } from "../geometry";

export type SpawningEnemy =
	{
		type: "spawning-enemy";
		id: string;
		position: Position;
		startedAt: number;
		duration: number;
		enemy: EnemyState;
	};
