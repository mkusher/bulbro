import type { Weapon } from "../weapon";

/**
 * A sharp blade weapon.
 */
export const sword: Weapon =
	{
		id: "sword",
		name: "Sword",
		classes:
			[
				"blade",
				"precise",
			],
		shotSpeed: 800,
		statsBonus:
			{
				damage: 25,
				meleeDamage: 15,
				range: 80,
				attackSpeed: 0.9,
				knockback: 8,
			},
		attack:
			{
				type: "combo",
				strikes:
					[
						{
							type: "swing",
							arc: 140,
							duration: 260,
						},
						{
							type: "thrust",
							duration: 220,
						},
					],
			},
		basePrice: 5,
	};
