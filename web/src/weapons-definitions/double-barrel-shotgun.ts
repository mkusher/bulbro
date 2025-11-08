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
				attackSpeed: 1.37,
				range: 350,
				knockback: 16,
			},
	};
