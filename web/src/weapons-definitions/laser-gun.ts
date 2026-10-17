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
				damage: 40,
				cooldown: 1.98,
				range: 500,
				knockback: 0,
				critChance: 3,
				critMultiplier: 2,
				scaling:
					{
						rangedDamage: 4,
					},
			},
		tierStats:
			{
				"2": {
					damage: 55,
					cooldown: 1.9,
					scaling:
						{
							rangedDamage: 4.5,
						},
				},
				"3": {
					damage: 70,
					cooldown: 1.82,
					scaling:
						{
							rangedDamage: 5,
						},
				},
				"4": {
					damage: 100,
					cooldown: 1.65,
					scaling:
						{
							rangedDamage: 6,
						},
				},
			},
		basePrice: 15,
		tierBasePrices:
			{
				2: 31,
				3: 61,
				4: 122,
			},
		attack:
			{
				type: "shot",
			},
	};
