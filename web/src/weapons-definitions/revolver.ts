import type { Weapon } from "../weapon";

/**
 * A six-shooter: quick, strong shots from a small magazine followed by a
 * long reload, unlike Pistol's steady cadence and SMG's rapid fire.
 */
export const revolver: Weapon =
	{
		id: "revolver",
		name: "Revolver",
		classes:
			[
				"gun",
			],
		shotSpeed: 1600,
		statsBonus:
			{
				damage: 10,
				cooldown: 0.35,
				magazine: 6,
				reload: 2,
				range: 450,
				knockback: 10,
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
					damage: 16,
					cooldown: 0.33,
					reload: 1.85,
					critChance: 15,
				},
				"3": {
					damage: 24,
					cooldown: 0.31,
					reload: 1.7,
					critChance: 20,
				},
				"4": {
					damage: 38,
					cooldown: 0.28,
					reload: 1.5,
					critChance: 25,
				},
			},
		basePrice: 22,
		tierBasePrices:
			{
				2: 44,
				3: 88,
				4: 176,
			},
		attack:
			{
				type: "shot",
			},
	};
