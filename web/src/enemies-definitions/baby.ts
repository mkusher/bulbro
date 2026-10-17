import type { EnemyCharacter } from "../enemy";
import { orcFist } from "../weapons-definitions/orc-fist";
import { baseStats } from "./base";

export const babyEnemy: EnemyCharacter =
	{
		id: "baby",
		name: "Baby colorado beetle",
		sprite:
			"potatoBeetleBaby",
		/** Brotato analogue: Baby Alien. See docs/balance.md. */
		stats:
			{
				...baseStats,

				maxHp: 3,
				speed: 200,
				damage: 1,
				range: 160,
				knockbackResistance: 0,
			},
		speedRange:
			{
				from: 200,
				to: 300,
			},
		waveIncreaseStats:
			{
				maxHp: 2,
				damage: 0.6,
			},
		weapons:
			[
				orcFist,
			],
		consumableDropChance: 0.01,
		behaviors:
			"chasing",
	};
