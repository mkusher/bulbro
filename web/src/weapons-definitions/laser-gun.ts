import type { Weapon } from "../weapon";

/**
 * A high-tech gun that fires energy beams.
 */
export const laserGun: Weapon =
	{
		id: "laserGun",
		name: "Laser Gun",
		classes:
			[
				"gun",
			],
		shotSpeed: 1500,
		statsBonus:
			{
				damage: 40,
				attackSpeed: 1.98,
				range: 500,
				knockback: 0,
			},
	};
