import { orcFist } from "../weapons-definitions/orcFist";
import { baseStats } from "./base";

export const chaserEnemy = {
	id: "chaser",
	name: "Chaser Enemy",
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
