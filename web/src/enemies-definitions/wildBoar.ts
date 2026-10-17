import { orcFist } from "@/weapons-definitions/orc-fist";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const wildBoar: EnemyCharacter =
	{
		id: "dzik",
		name: "Wild Boar",
		sprite:
			"wildBoar",
		/** Brotato analogue: Charger. See docs/balance.md. */
		stats:
			{
				...baseStats,

				maxHp: 4,
				speed: 400,
				damage: 1,
				range: 80,
				materialsDropped: 1,
				knockbackResistance: 0.8,
			},
		waveIncreaseStats:
			{
				maxHp: 2.5,
				damage: 0.85,
			},
		weapons:
			[
				orcFist,
			],
		consumableDropChance: 0.01,
		behaviors:
			"rage-running",
	};
