import type { EnemyCharacter } from "../enemy";
import { orcFist } from "../weapons-definitions/orc-fist";
import { baseStats } from "./base";

export const babyEnemy: EnemyCharacter = {
	id: "baby",
	name: "Baby enemy",
	sprite: "potatoBeetleBaby",
	stats: {
		...baseStats,
		maxHp: 2,
		speed: 150,
		damage: 1,
		range: 80,
		materialsDropped: 1,
	},
	weapons: [orcFist],
};
