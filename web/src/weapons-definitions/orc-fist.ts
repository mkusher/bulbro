import type { Weapon } from "../weapon";

/**
 * Orc's unarmed attack - more powerful than human fist.
 */
export const orcFist: Weapon =
	{
		id: "enemyFist", // Note: This should probably be "orcFist" but keeping as "fist" for compatibility
		name: "Enemy Fist",
		classes:
			[
				"unarmed",
				"heavy",
			],
		shotSpeed: 100,
		statsBonus:
			{
				range: 40,
				damage: 3,
				meleeDamage: 5,
				attackSpeed: 30,
			},
	};
