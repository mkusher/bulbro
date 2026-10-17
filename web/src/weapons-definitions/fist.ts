import type { Weapon } from "../weapon";

/**
 * The most basic unarmed attack.
 */
export const fist: Weapon =
	{
		id: "fist",
		name: "Fist",
		classes:
			[
				"unarmed",
			],
		shotSpeed: 1000,
		statsBonus:
			{
				damage: 8,
				cooldown: 0.78,
				range: 150,
				knockback: 15,
				critChance: 1,
				critMultiplier: 1.5,
				scaling:
					{
						meleeDamage: 1,
					},
			},
		tierStats:
			{
				"2": {
					damage: 16,
					cooldown: 0.73,
				},
				"3": {
					damage: 32,
					cooldown: 0.69,
				},
				"4": {
					damage: 64,
					cooldown: 0.59,
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
				duration: 180,
			},
	};
