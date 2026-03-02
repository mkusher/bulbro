import type { EnemyCharacter } from "../enemy";
import { orcFist } from "../weapons-definitions/orc-fist";
import { baseStats } from "./base";

export const babyEnemy: EnemyCharacter =
	{
		id: "baby",
		name: "Baby colorado beetle",
		sprite:
			"potatoBeetleBaby",
		stats:
			{
				...baseStats,
				maxHp: 3,
				speed: 200,
				damage: 1,
				range: 100,
			},
		waveIncreaseStats:
			{
				maxHp: 2,
				damage: 1,
			},
		weapons:
			[
				orcFist,
			],
		behaviors:
			"default",
	};
