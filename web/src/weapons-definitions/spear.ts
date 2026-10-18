import type { Weapon } from "../weapon";

/**
 * A long, narrow polearm. Its thrust reaches far and hits every enemy
 * along the shaft once, trading Knife's speed for reach and line coverage.
 */
export const spear: Weapon =
	{
		id: "spear",
		name: "Spear",
		classes:
			[
				"medieval",
				"precise",
			],
		shotSpeed: 500,
		statsBonus:
			{
				damage: 12,
				cooldown: 1.3,
				range: 260,
				knockback: 10,
				critChance: 5,
				critMultiplier: 2,
				scaling:
					{
						meleeDamage: 1,
					},
			},
		tierStats:
			{
				"2": {
					damage: 19,
					cooldown: 1.22,
					critChance: 8,
				},
				"3": {
					damage: 28,
					cooldown: 1.13,
					critChance: 11,
				},
				"4": {
					damage: 42,
					cooldown: 1,
					critChance: 14,
				},
			},
		basePrice: 18,
		tierBasePrices:
			{
				2: 36,
				3: 70,
				4: 140,
			},
		attack:
			{
				type: "thrust",
				duration: 320,
			},
	};
