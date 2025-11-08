import type { Weapon } from "../weapon";

/**
 * The most basic unarmed attack.
 */
export const fist: Weapon =
	{
		id: "fist",
		name: "Fist",
		classes:
			[
				"unarmed",
			],
		shotSpeed: 1000,
		statsBonus:
			{
				damage: 8,
				meleeDamage: 1,
				attackSpeed: 0.78,
				range: 150,
			},
	};
