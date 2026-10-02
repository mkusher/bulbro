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
				"heavy",
				"explosive",
			],
		shotSpeed: 1500,
		statsBonus:
			{
				damage:
					3 *
					4,
				cooldown: 1.37,
				range: 350,
				knockback: 16,
				critChance: 3,
				scaling:
					{
						rangedDamage: 0.8,
					},
			},
		basePrice: 5,
		attack:
			{
				type: "shot",
			},
	};
