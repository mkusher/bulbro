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
				attackSpeed: 0.5,
				knockback: 5,
			},
	};
