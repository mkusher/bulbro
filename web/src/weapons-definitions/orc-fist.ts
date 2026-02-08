import type { Weapon } from "../weapon";

/**
 * Orc's unarmed attack - more powerful than human fist.
 */
export const orcFist: Weapon =
	{
		id: "enemyFist",
		name: "Enemy Fist",
		classes:
			[
				"unarmed",
				"heavy",
			],
		shotSpeed: 500,
		statsBonus:
			{
				range: 60,
				damage: 3,
				meleeDamage: 5,
				attackSpeed: 1,
			},
	};
