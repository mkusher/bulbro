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
				range: 500,
				cooldown: 0.3,
				knockback: 5,
				critChance: 5,
				scaling:
					{
						rangedDamage: 0.8,
					},
			},
		basePrice: 5,
		attack:
			{
				type: "shot",
			},
	};
