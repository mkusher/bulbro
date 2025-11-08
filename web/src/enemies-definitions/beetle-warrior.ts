import { orcFist } from "@/weapons-definitions/orc-fist";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const beetleWarrior: EnemyCharacter =
	{
		id: "potatoBeetleWarrior",
		name: "Beetle Warrior",
		sprite:
			"potatoBeetleWarrior",
		stats:
			{
				...baseStats,
				maxHp: 36,
				speed: 150,
				damage: 3,
				range: 80,
				attackSpeed: 2,
			},
		weapons:
			[
				orcFist,
			],
		behaviors:
			"rage-running",
	};
