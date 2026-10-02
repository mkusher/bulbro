import type { Weapon } from "../weapon";

/** A heavy gun with sustained rapid fire and long reach. */
export const machineGun: Weapon =
	{
		id: "machineGun",
		name: "Machine Gun",
		classes:
			[
				"gun",
				"heavy",
			],
		shotSpeed: 1900,
		statsBonus:
			{
				damage: 3,
				cooldown: 0.14,
				range: 600,
				knockback: 2,
				critChance: 3,
				scaling:
					{
						rangedDamage: 0.6,
					},
			},
		basePrice: 10,
		attack:
			{
				type: "shot",
			},
	};
