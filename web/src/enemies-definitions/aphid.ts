import { aphidGun } from "@/weapons-definitions/aphid-gun";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const aphidEnemy: EnemyCharacter =
	{
		id: "aphid",
		name: "Aphid",
		sprite:
			"aphid",
		stats:
			{
				...baseStats,
				maxHp: 8,
				speed: 150,
				damage: 1,
				range: 1200,
			},
		waveIncreaseStats:
			{
				maxHp: 1,
				damage: 1,
			},
		weapons:
			[
				aphidGun,
			],
		behaviors:
			"keeping-distance",
	};
