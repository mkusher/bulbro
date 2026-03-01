import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";
import { aphidGun } from "@/weapons-definitions";

export const beetleArcher: EnemyCharacter =
	{
		id: "beetleArcher",
		name: "Colorado beetle archer",
		sprite:
			"beetleArcher",
		stats:
			{
				...baseStats,
				maxHp: 2,
				speed: 380,
				damage: 3,
				range: 80,
				attackSpeed: 2,
				materialsDropped: 1,
			},
		waveIncreaseStats:
			{
				maxHp: 1,
			},
		weapons:
			[
				aphidGun,
			],
		behaviors:
			"keeping-distance",
	};
