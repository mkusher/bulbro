import { aphidGun } from "@/weapons-definitions/aphid-gun";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const aphidEnemy: EnemyCharacter =
	{
		id: "aphid",
		name: "Aphid",
		sprite:
			"aphid",
		/** Brotato analogue: Spitter. See docs/balance.md. */
		stats:
			{
				...baseStats,

				maxHp: 8,
				speed: 200,
				damage: 1,
				range: 1200,
				knockbackResistance: 0.95,
			},
		waveIncreaseStats:
			{
				maxHp: 1,
				damage: 0.75,
			},
		weapons:
			[
				aphidGun,
			],
		consumableDropChance: 0.03,
		behaviors:
			"keeping-distance",
	};
