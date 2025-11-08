import type { Weapon } from "../weapon";

/**
 * A heavy blunt weapon: a brick.
 */
export const brick: Weapon =
	{
		id: "brick",
		name: "Brick",
		classes:
			[
				"blunt",
				"heavy",
			],
		shotSpeed: 1000,
		statsBonus:
			{
				range: 150,
				knockback: 5,
				attackSpeed: 1.39,
				damage: 30,
			},
	};
