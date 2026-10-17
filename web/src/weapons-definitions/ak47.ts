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
				damage: 5,
				range: 500,
				cooldown: 0.22,
				knockback: 5,
				critChance: 5,
				scaling:
					{
						rangedDamage: 0.8,
					},
			},
		basePrice: 65,
		attack:
			{
				type: "shot",
			},
	};
