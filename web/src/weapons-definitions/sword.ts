import type { Weapon } from "../weapon";

/**
 * A sharp blade weapon.
 */
export const sword: Weapon =
	{
		id: "sword",
		name: "Sword",
		classes:
			[
				"blade",
				"medieval",
			],
		shotSpeed: 800,
		statsBonus:
			{
				damage: 30,
				cooldown: 1.28,
				range: 200,
				knockback: 5,
				critChance: 3,
				critMultiplier: 2,
				scaling:
					{
						meleeDamage: 1,
					},
			},
		tierStats:
			{
				"3": {
					damage: 45,
					cooldown: 1.13,
				},
				"4": {
					damage: 65,
					cooldown: 0.98,
				},
			},
		attack:
			{
				type: "combo",
				strikes:
					[
						{
							type: "swing",
							arc: 140,
							duration: 260,
						},
						{
							type: "thrust",
							duration: 220,
						},
					],
			},
		minTier: 2,
		basePrice: 51,
		tierBasePrices:
			{
				2: 51,
				3: 95,
				4: 190,
			},
	};
