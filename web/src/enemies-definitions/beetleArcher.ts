import { aphidGun } from "@/weapons-definitions";
import type { EnemyCharacter } from "../enemy";
import {
	baseConsumableDropChance,
	baseStats,
} from "./base";

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
				range: 1200,
				attackSpeed: 2,
				materialsDropped: 1,
			},
		waveIncreaseStats:
			{
				maxHp: 5,
				materialsDropped: 1,
			},
		weapons:
			[
				aphidGun,
			],
		consumableDropChance:
			baseConsumableDropChance,
		behaviors:
			"keeping-distance",
	};
