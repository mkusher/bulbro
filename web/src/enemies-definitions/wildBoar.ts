import { orcFist } from "@/weapons-definitions/orc-fist";
import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";

export const wildBoar: EnemyCharacter =
	{
		id: "dzik",
		name: "Wild Boar",
		sprite:
			"wildBoar",
		stats:
			{
				...baseStats,
				maxHp: 10,
				speed: 280,
				damage: 3,
				range: 80,
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
			"default",
	};
