import type { Weapon } from "../weapon";

/**
 * A thrown boomerang that flies through enemies to the end of its range and
 * comes back to the thrower, hitting each enemy once on the way out and once
 * on the way back.
 */
export const boomerang: Weapon =
	{
		id: "boomerang",
		name: "Boomerang",
		classes:
			[
				"blunt",
				"precise",
			],
		shotSpeed: 650,
		statsBonus:
			{
				damage: 8,
				cooldown: 1.5,
				range: 350,
				knockback: 5,
				critChance: 3,
				critMultiplier: 2,
				scaling:
					{
						rangedDamage: 0.8,
					},
			},
		tierStats:
			{
				"2": {
					damage: 13,
					cooldown: 1.4,
					critChance: 6,
				},
				"3": {
					damage: 19,
					cooldown: 1.3,
					critChance: 9,
				},
				"4": {
					damage: 28,
					cooldown: 1.15,
					critChance: 12,
				},
			},
		basePrice: 16,
		tierBasePrices:
			{
				2: 32,
				3: 64,
				4: 128,
			},
		attack:
			{
				type: "boomerang",
			},
	};
