import { orcFist } from "@/weapons-definitions/orc-fist";
import type { EnemyCharacter } from "../enemy";
import {
	baseConsumableDropChance,
	baseStats,
} from "./base";

export const beetleWarrior: EnemyCharacter =
	{
		id: "potatoBeetleWarrior",
		name: "Beetle Warrior",
		sprite:
			"potatoBeetleWarrior",
		stats:
			{
				...baseStats,
				maxHp: 6,
				speed: 150,
				damage: 3,
				range: 80,
				attackSpeed: 2,
				materialsDropped: 4,
			},
		waveIncreaseStats:
			{
				maxHp: 6,
			},
		weapons:
			[
				orcFist,
			],
		consumableDropChance:
			baseConsumableDropChance,
		behaviors:
			"rage-running",
	};
