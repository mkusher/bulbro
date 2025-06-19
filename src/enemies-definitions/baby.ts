import type { EnemyCharacter } from "../enemy";
import { orcFist } from "../weapons-definitions/orcFist";
import { baseStats } from "./base";

export const babyEnemy: EnemyCharacter = {
	id: "baby",
	name: "Baby enemy",
	sprite: "orc",
	stats: {
		...baseStats,
		maxHp: 2,
		speed: 100,
		damage: 1,
		range: 0,
		attackSpeed: 0,
		materialsDropped: 1,
	},
	weapons: [orcFist],
};
