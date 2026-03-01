import { orcFist } from "@/weapons-definitions/orc-fist";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const coloradoBeetle: EnemyCharacter =
	{
		id: "coloradoBeetle",
		name: "Colorado beetle warrior",
		sprite:
			"coloradoBeetle",
		stats:
			{
				...baseStats,
				maxHp: 2,
				speed: 380,
				damage: 1,
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
				orcFist,
			],
		behaviors:
			"default",
	};
