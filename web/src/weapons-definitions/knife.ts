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
				attackSpeed: 1.01,
				range: 150,
				knockback: 2,
			},
	};
