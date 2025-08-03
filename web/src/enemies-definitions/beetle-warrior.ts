import type { EnemyCharacter } from "../enemy";
import { orcSlowGun } from "../weapons-definitions/orc-gun";
import { baseStats } from "./base";

export const beetleWarrior = {
	id: "potatoBeetleWarrior",
	name: "Beetle Warrior",
	sprite: "potatoBeetleWarrior",
	stats: {
		...baseStats,
		maxHp: 12,
		speed: 100,
		damage: 1,
		range: 1,
		attackSpeed: 1,
	},
	weapons: [orcSlowGun],
} as const satisfies EnemyCharacter;
