import type { Weapon } from "../weapon";

/** A long-range launcher trading fire rate for damage and knockback. */
export const bazooka: Weapon =
	{
		id: "bazooka",
		name: "Bazooka",
		classes:
			[
				"explosive",
				"heavy",
				"gun",
			],
		shotSpeed: 1000,
		statsBonus:
			{
				damage: 40,
				cooldown: 2.8,
				range: 650,
				knockback: 18,
				critChance: 3,
				scaling:
					{
						rangedDamage: 1.5,
					},
			},
		basePrice: 14,
		attack:
			{
				type: "shot",
			},
	};
