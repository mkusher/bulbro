import type { EnemyCharacter } from "../enemy";
import { orcSlowGun } from "../weapons-definitions/orc-gun";
import { baseStats } from "./base";

export const spitterEnemy: EnemyCharacter = {
	id: "spitter",
	name: "Spitter Enemy",
	sprite: "slime",
	stats: {
		...baseStats,
		maxHp: 8,
		speed: 100,
		damage: 1,
		range: 1,
		attackSpeed: 1,
	},
	weapons: [orcSlowGun],
};
