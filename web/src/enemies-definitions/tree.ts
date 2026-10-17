import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const tree: EnemyCharacter =
	{
		id: "tree",
		name: "Tree",
		sprite:
			"tree",
		/** Brotato analogue: Tree. See docs/balance.md. */
		stats:
			{
				...baseStats,

				maxHp: 10,
				speed: 0,
				range: 0,
				materialsDropped: 3,
				knockbackResistance: 1,
			},
		waveIncreaseStats:
			{
				maxHp: 5,
			},
		weapons:
			[],
		consumableDropChance: 1,
		behaviors:
			"stationary",
	};
