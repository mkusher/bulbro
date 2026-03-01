import type { Weapon } from "../weapon";

/**
 * A powerful assault rifle.
 */
export const ak47: Weapon =
	{
		id: "ak47",
		name: "AK-47",
		classes:
			[
				"gun",
				"heavy",
			],
		shotSpeed: 1800,
		statsBonus:
			{
				damage: 2,
				rangedDamage: 2,
				range: 500,
				attackSpeed: 0.3,
				knockback: 5,
			},
		basePrice: 5,
	};
