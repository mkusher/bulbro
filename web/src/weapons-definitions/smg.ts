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
				attackSpeed: 0.2,
				range: 400,
			},
		basePrice: 5,
	};
