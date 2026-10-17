import type { Weapon } from "../weapon";

export const pruner: Weapon =
	{
		id: "pruner",
		name: "Pruner",
		classes:
			[
				"support",
			],
		shotSpeed: 0,
		basePrice: 15,
		statsBonus:
			{
				damage: 10,
				cooldown: 1.14,
				range: 150,
				knockback: 2,
				critChance: 3,
				critMultiplier: 1.25,
				scaling:
					{
						meleeDamage: 0.5,
					},
			},
		tierStats:
			{
				2: {
					damage: 15,
					cooldown: 1.06,
					critChance: 6,
					critMultiplier: 1.5,
					scaling:
						{
							meleeDamage: 0.65,
						},
				},
				3: {
					damage: 20,
					cooldown: 0.98,
					critChance: 9,
					critMultiplier: 1.75,
					scaling:
						{
							meleeDamage: 0.8,
						},
				},
				4: {
					damage: 25,
					cooldown: 0.89,
					critChance: 12,
					critMultiplier: 2,
					scaling:
						{
							meleeDamage: 1,
						},
				},
			},
		tierBasePrices:
			{
				2: 28,
				3: 52,
				4: 95,
			},
		attack:
			{
				type: "thrust",
				duration: 220,
			},
	};
export const screwdriver: Weapon =
	{
		id: "screwdriver",
		name: "Screwdriver",
		classes:
			[
				"tool",
			],
		shotSpeed: 0,
		basePrice: 10,
		statsBonus:
			{
				damage: 8,
				cooldown: 1.06,
				range: 135,
				knockback: 3,
				critChance: 10,
				critMultiplier: 2,
				scaling:
					{
						meleeDamage: 0.5,
						engineering: 0.5,
					},
			},
		tierStats:
			{
				2: {
					damage: 12,
					cooldown: 1.01,
					critChance: 15,
					critMultiplier: 2.15,
					scaling:
						{
							meleeDamage: 0.5,
							engineering: 0.6,
						},
				},
				3: {
					damage: 16,
					cooldown: 0.98,
					critChance: 20,
					critMultiplier: 2.3,
					scaling:
						{
							meleeDamage: 0.5,
							engineering: 0.7,
						},
				},
				4: {
					damage: 20,
					cooldown: 0.88,
					critChance: 30,
					critMultiplier: 2.5,
					scaling:
						{
							meleeDamage: 0.5,
							engineering: 0.8,
						},
				},
			},
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
export const wrench: Weapon =
	{
		id: "wrench",
		name: "Wrench",
		classes:
			[
				"tool",
			],
		shotSpeed: 0,
		basePrice: 20,
		statsBonus:
			{
				damage: 12,
				cooldown: 1.7,
				range: 175,
				knockback: 20,
				critChance: 3,
				critMultiplier: 2,
				scaling:
					{
						meleeDamage: 1,
					},
			},
		tierStats:
			{
				2: {
					damage: 16,
					cooldown: 1.64,
				},
				3: {
					damage: 20,
					cooldown: 1.55,
				},
				4: {
					damage: 24,
					cooldown: 1.49,
				},
			},
		tierBasePrices:
			{
				2: 39,
				3: 74,
				4: 149,
			},
		attack:
			{
				type: "swing",
				arc: 120,
				duration: 300,
			},
	};
