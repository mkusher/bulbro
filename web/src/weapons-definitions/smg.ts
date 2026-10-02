import type { Weapon } from "../weapon";

/**
 * A rapid-fire submachine gun.
 */
export const smg: Weapon =
	{
		id: "smg",
		name: "SMG",
		classes:
			[
				"gun",
				"support",
			],
		shotSpeed: 1400,
		statsBonus:
			{
				damage: 1,
				cooldown: 0.2,
				range: 400,
				critChance: 1,
				scaling:
					{
						rangedDamage: 0.5,
					},
			},
		basePrice: 5,
		attack:
			{
				type: "shot",
			},
	};
