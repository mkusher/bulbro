import type { Weapon } from "../weapon";

/**
 * A standard one-handed firearm.
 */
export const pistol: Weapon =
	{
		id: "pistol",
		name: "Pistol",
		classes:
			[
				"gun",
			],
		shotSpeed: 1500,
		statsBonus:
			{
				damage: 12,
				cooldown: 1.2,
				range: 400,
				knockback: 15,
				critChance: 10,
				critMultiplier: 2,
				scaling:
					{
						rangedDamage: 1,
					},
			},
		tierStats:
			{
				"2": {
					damage: 20,
					cooldown: 1.12,
					critChance: 15,
				},
				"3": {
					damage: 30,
					cooldown: 1.03,
					critChance: 20,
				},
				"4": {
					damage: 50,
					cooldown: 0.87,
					critChance: 25,
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
				type: "shot",
			},
	};
