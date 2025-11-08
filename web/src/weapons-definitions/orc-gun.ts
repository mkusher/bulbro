import type { Weapon } from "../weapon";

/**
 * The most basic orc's gun
 */
export const orcSlowGun: Weapon =
	{
		id: "orcGun",
		name: "Orc Very Slow Gun",
		classes:
			[
				"gun",
			],
		shotSpeed: 150,
		statsBonus:
			{
				range: 2000,
				damage: 5,
				attackSpeed: 5,
			},
	};
