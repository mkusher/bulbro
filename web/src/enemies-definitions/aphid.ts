import type { EnemyCharacter } from "../enemy";
import { baseStats } from "./base";
import type { Weapon } from "../weapon";

const gun: Weapon = {
	id: "enemyGun",
	name: "Ranged Enemy Gun",
	classes: ["gun"],
	shotSpeed: 250,
	statsBonus: {},
};

export const aphidEnemy: EnemyCharacter = {
	id: "aphid",
	name: "Aphid Enemy",
	sprite: "aphid",
	stats: {
		...baseStats,
		maxHp: 2,
		speed: 150,
		damage: 2,
		range: 2000,
	},
	weapons: [gun],
	behaviors: "keeping-distance",
};
