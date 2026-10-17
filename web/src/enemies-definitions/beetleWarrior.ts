import { orcFist } from "@/weapons-definitions/orc-fist";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const beetleWarrior: EnemyCharacter =
	{
		id: "potatoBeetleWarrior",
		name: "Beetle Warrior",
		sprite:
			"potatoBeetleWarrior",
		/** Brotato analogue: Bruiser. See docs/balance.md. */
		stats:
			{
				...baseStats,

				maxHp: 20,
				speed: 300,
				damage: 2,
				range: 80,
				materialsDropped: 3,
				knockbackResistance: 0.9,
			},
		waveIncreaseStats:
			{
				maxHp: 11,
				damage: 0.85,
			},
		weapons:
			[
				orcFist,
			],
		consumableDropChance: 0.03,
		behaviors:
			"rage-running",
	};
