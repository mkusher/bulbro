import type { Weapon } from "../weapon";

/** A slower sidearm that scales primarily with elemental damage. */
export const flareGun: Weapon =
	{
		id: "flareGun",
		name: "Flare Gun",
		classes:
			[
				"gun",
				"elemental",
			],
		shotSpeed: 900,
		statsBonus:
			{
				damage: 8,
				cooldown: 1.4,
				range: 420,
				knockback: 2,
				critChance: 3,
				scaling:
					{
						rangedDamage: 0.5,
						elementalDamage: 1,
					},
			},
		basePrice: 7,
		attack:
			{
				type: "shot",
			},
	};
