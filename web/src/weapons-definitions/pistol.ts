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
				"precise",
			],
		shotSpeed: 1500,
		statsBonus:
			{
				damage: 2,
				range: 400,
				cooldown: 0.5,
				knockback: 5,
				critChance: 5,
				scaling:
					{
						rangedDamage: 1,
					},
			},
		basePrice: 5,
		attack:
			{
				type: "shot",
			},
	};
