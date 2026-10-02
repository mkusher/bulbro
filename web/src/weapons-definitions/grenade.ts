import type { Weapon } from "../weapon";

/** A short-range, slow projectile with a heavy impact. */
export const grenade: Weapon =
	{
		id: "grenade",
		name: "Grenade",
		classes:
			[
				"explosive",
				"heavy",
			],
		shotSpeed: 600,
		statsBonus:
			{
				damage: 24,
				cooldown: 2,
				range: 300,
				knockback: 12,
				critChance: 3,
				scaling:
					{
						rangedDamage: 1,
						elementalDamage: 0.5,
					},
			},
		basePrice: 9,
		attack:
			{
				type: "shot",
			},
	};
