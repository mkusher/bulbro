import type { EnemyCharacter } from "../enemy";
import { orcFist } from "../weapons-definitions/orc-fist";
import { baseStats } from "./base";

export const aphidEnemy: EnemyCharacter = {
	id: "aphid",
	name: "Aphid Enemy",
	sprite: "aphid",
	stats: {
		...baseStats,
		maxHp: 1,
		speed: 380,
		damage: 1,
		range: 0,
		attackSpeed: 0,
	},
	weapons: [orcFist],
};
