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
				scaling:
					{
						meleeDamage: 1,
					},
			},
		basePrice: 5,
		attack:
			{
				type: "thrust",
				duration: 180,
			},
	};
