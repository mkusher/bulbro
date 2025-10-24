import type { EnemyCharacter } from "../enemy";
import { orcFist } from "../weapons-definitions/orc-fist";
import { baseStats } from "./base";

export const treeEnemy: EnemyCharacter = {
	id: "tree",
	name: "Tree",
	sprite: "tree",
	stats: {
		...baseStats,
		maxHp: 60,
		speed: 0,
		range: 0,
		materialsDropped: 0,
	},
	weapons: [orcFist],
};
