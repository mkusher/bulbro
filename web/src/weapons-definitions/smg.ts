import type { Weapon } from "../weapon";

/**
 * A rapid-fire submachine gun.
 */
export const smg: Weapon =
	{
		id: "smg",
		name: "SMG",
		classes:
			[
				"gun",
			],
		shotSpeed: 1400,
		statsBonus:
			{
				damage: 3,
				cooldown: 0.17,
				range: 400,
				knockback: 0,
				critChance: 1,
				critMultiplier: 1.5,
				scaling:
					{
						rangedDamage: 0.5,
					},
			},
		tierStats:
			{
				"2": {
					damage: 4,
					cooldown: 0.17,
					scaling:
						{
							rangedDamage: 0.6,
						},
				},
				"3": {
					damage: 5,
					cooldown: 0.17,
					scaling:
						{
							rangedDamage: 0.7,
						},
				},
				"4": {
					damage: 8,
					cooldown: 0.15,
					scaling:
						{
							rangedDamage: 0.8,
						},
				},
			},
		basePrice: 20,
		tierBasePrices:
			{
				2: 39,
				3: 74,
				4: 149,
			},
		attack:
			{
				type: "shot",
			},
	};
