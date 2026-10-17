import type { Weapon } from "../weapon";

/**
 * A sharp blade for precise melee attacks.
 */
export const knife: Weapon =
	{
		id: "knife",
		name: "Knife",
		classes:
			[
				"precise",
			],
		shotSpeed: 500,
		statsBonus:
			{
				damage: 9,
				cooldown: 1.01,
				range: 150,
				knockback: 2,
				critChance: 20,
				critMultiplier: 2.5,
				scaling:
					{
						meleeDamage: 0.8,
					},
			},
		tierStats:
			{
				"2": {
					damage: 13,
					cooldown: 0.93,
					critChance: 30,
					critMultiplier: 3,
				},
				"3": {
					damage: 18,
					cooldown: 0.86,
					critChance: 40,
					critMultiplier: 3.5,
				},
				"4": {
					damage: 25,
					cooldown: 0.78,
					critChance: 50,
					critMultiplier: 4,
				},
			},
		basePrice: 10,
		tierBasePrices:
			{
				2: 22,
				3: 45,
				4: 91,
			},
		attack:
			{
				type: "thrust",
				duration: 200,
			},
	};
