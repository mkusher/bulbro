export const baseMaxHp = 1;
export const baseSpeed = 200;
export const baseStats = {
	maxHp: baseMaxHp,
	speed: baseSpeed,
	hpRegeneration: 0,
	damage: 0,
	meleeDamage: 0,
	rangedDamage: 0,
	elementalDamage: 0,
	attackSpeed: 1,
	critChance: 0,
	range: 0,
	armor: 0,
	dodge: 0,
	materialsDropped: 1,
	knockback: 1,
};

export type EnemyStats = typeof baseStats;
