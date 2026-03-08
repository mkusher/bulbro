import { orcFist } from "@/weapons-definitions/orc-fist";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const badger: EnemyCharacter =
	{
		id: "badger",
		name: "Badger",
		sprite:
			"badger",
		stats:
			{
				...baseStats,
				maxHp: 10,
				speed: 280,
				damage: 3,
				range: 100,
				attackSpeed: 2,
				materialsDropped: 3,
			},
		waveIncreaseStats:
			{
				maxHp: 1,
			},
		weapons:
			[
				orcFist,
			],
		behaviors:
			"chasing",
	};
