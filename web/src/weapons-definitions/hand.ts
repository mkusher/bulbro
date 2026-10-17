import type { Weapon } from "../weapon";

/**
 * A simple tool-like weapon: the hand.
 */
export const hand: Weapon =
	{
		id: "hand",
		name: "Hand",
		classes:
			[
				"unarmed",
				"support",
			],
		shotSpeed: 1000,
		statsBonus:
			{
				damage: 1,
				cooldown: 1.01,
				range: 150,
				knockback: 30,
				critChance: 1,
				critMultiplier: 1.5,
				scaling:
					{
						meleeDamage: 0.5,
					},
				harvesting: 3,
			},
		tierStats:
			{
				"2": {
					cooldown: 0.93,
					harvesting: 6,
				},
				"3": {
					cooldown: 0.86,
					harvesting: 12,
				},
				"4": {
					cooldown: 0.71,
					harvesting: 25,
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
				duration: 220,
			},
	};
