import { orcFist } from "@/weapons-definitions/orc-fist";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const coloradoBeetle: EnemyCharacter =
	{
		id: "coloradoBeetle",
		name: "Colorado beetle warrior",
		sprite:
			"coloradoBeetle",
		/** Brotato analogue: Chaser. See docs/balance.md. */
		stats:
			{
				...baseStats,

				maxHp: 1,
				speed: 380,
				damage: 1,
				range: 100,
				materialsDropped: 1,
				knockbackResistance: 0,
			},
		waveIncreaseStats:
			{
				maxHp: 1,
				damage: 0.6,
			},
		weapons:
			[
				orcFist,
			],
		consumableDropChance: 0.02,
		behaviors:
			"chasing",
	};
