import { orcFist } from "../weapons-definitions/orcFist";
import { baseStats } from "./base";

export const spitterEnemy = {
	id: "spitter",
	name: "Spitter Enemy",
	stats: {
		...baseStats,
		maxHp: 8,
		speed: 100,
		damage: 1,
		range: 1,
		attackSpeed: 1,
	},
	weapons: [orcFist],
};
