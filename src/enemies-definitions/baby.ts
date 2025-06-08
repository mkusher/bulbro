import { orcFist } from "../weapons-definitions/orcFist";
import { baseStats } from "./base";

export const babyEnemy = {
	stats: {
		...baseStats,
		maxHp: 2,
		speed: 100,
		damage: 1,
		range: 0,
		attackSpeed: 0,
	},
	weapons: [orcFist],
};
