import { aphidGun } from "@/weapons-definitions/aphid-gun";
import type { EnemyCharacter } from "../enemy";
import type { Weapon } from "../weapon";
import { baseStats } from "./base";

export const aphidEnemy: EnemyCharacter =
	{
		id: "aphid",
		name: "Aphid Enemy",
		sprite:
			"aphid",
		stats:
			{
				...baseStats,
				maxHp: 2,
				speed: 150,
				damage: 2,
				range: 2000,
			},
		weapons:
			[
				aphidGun,
			],
		behaviors:
			"keeping-distance",
	};
