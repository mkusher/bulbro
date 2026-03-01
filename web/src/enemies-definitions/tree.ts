import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const tree: EnemyCharacter =
	{
		id: "tree",
		name: "Tree",
		sprite:
			"tree",
		stats:
			{
				...baseStats,
				maxHp: 12,
				speed: 0,
				range: 0,
				materialsDropped: 3,
			},
		waveIncreaseStats:
			{
				maxHp: 6,
			},
		weapons:
			[],
	};
