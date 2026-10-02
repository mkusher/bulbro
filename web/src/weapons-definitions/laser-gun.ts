import type { Weapon } from "../weapon";

/**
 * A high-tech gun that fires energy beams.
 */
export const laserGun: Weapon =
	{
		id: "laserGun",
		name: "Laser Gun",
		classes:
			[
				"gun",
			],
		shotSpeed: 1500,
		statsBonus:
			{
				damage: 4,
				cooldown: 1.98,
				range: 500,
				knockback: 0,
				critChance: 3,
				scaling:
					{
						rangedDamage: 1,
						elementalDamage: 0.5,
					},
			},
		basePrice: 5,
		attack:
			{
				type: "shot",
			},
	};
