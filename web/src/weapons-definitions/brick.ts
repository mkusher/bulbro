import type { Weapon } from "../weapon";

/**
 * A heavy blunt weapon: a brick.
 */
export const brick: Weapon =
	{
		id: "brick",
		name: "Brick",
		classes:
			[
				"blunt",
			],
		shotSpeed: 1000,
		statsBonus:
			{
				damage: 30,
				cooldown: 1.39,
				range: 150,
				knockback: 5,
				critChance: 3,
				critMultiplier: 1.5,
				scaling:
					{
						meleeDamage: 0.5,
						engineering: 0.5,
					},
			},
		tierStats:
			{
				"2": {
					damage: 60,
					scaling:
						{
							meleeDamage: 0.65,
							engineering: 0.65,
						},
				},
				"3": {
					damage: 90,
					scaling:
						{
							meleeDamage: 0.8,
							engineering: 0.8,
						},
				},
				"4": {
					damage: 120,
					scaling:
						{
							meleeDamage: 1,
							engineering: 1,
						},
				},
			},
		basePrice: 6,
		tierBasePrices:
			{
				2: 14,
				3: 22,
				4: 40,
			},
		attack:
			{
				type: "swing",
				arc: 110,
				duration: 320,
			},
	};
