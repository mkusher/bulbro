import { orcFist } from "@/weapons-definitions/orc-fist";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const roach: EnemyCharacter =
	{
		id: "roach",
		name: "Roach",
		sprite:
			"roach",
		stats:
			{
				...baseStats,
				maxHp: 10,
				speed: 280,
				damage: 3,
				range: 100,
				attackSpeed: 2,
				materialsDropped: 3,
			},
		waveIncreaseStats:
			{
				maxHp: 4,
			},
		weapons:
			[
				orcFist,
			],
		behaviors:
			"default",
	};
