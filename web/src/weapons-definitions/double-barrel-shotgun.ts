import type { Weapon } from "../weapon";

/**
 * A powerful but slow two-shot shotgun.
 */
export const doubleBarrelShotgun: Weapon =
	{
		id: "doubleBarrelShotgun",
		name: "Double Barrel Shotgun",
		classes:
			[
				"gun",
			],
		shotSpeed: 1500,
		statsBonus:
			{
				damage: 3,
				projectiles: 4,
				spread: 0.4,
				cooldown: 1.37,
				range: 350,
				knockback: 8,
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
					damage: 6,
					cooldown: 1.28,
					scaling:
						{
							rangedDamage: 0.85,
						},
				},
				"3": {
					damage: 9,
					cooldown: 1.2,
					scaling:
						{
							rangedDamage: 0.9,
						},
				},
				"4": {
					damage: 9,
					projectiles: 6,
					cooldown: 1.2,
					scaling:
						{
							rangedDamage: 1,
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
