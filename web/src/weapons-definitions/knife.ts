import type { Weapon } from "../weapon";

/**
 * A sharp blade for precise melee attacks.
 */
export const knife: Weapon =
	{
		id: "knife",
		name: "Knife",
		classes:
			[
				"blade",
				"precise",
			],
		shotSpeed: 500,
		statsBonus:
			{
				damage: 6,
				cooldown: 1.01,
				range: 150,
				knockback: 2,
				critChance: 20,
				critMultiplier: 2.5,
				scaling:
					{
						meleeDamage: 0.8,
					},
			},
		basePrice: 5,
		attack:
			{
				type: "thrust",
				duration: 200,
			},
	};
