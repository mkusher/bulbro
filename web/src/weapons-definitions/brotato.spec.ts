import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	spawnBulbro,
	BulbroState,
} from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions";
import { calculateAttackDamage } from "@/game-formulas";
import { zeroPoint } from "@/geometry";
import { generateWeaponShopItems } from "@/shop/ShopItemsGenerator";
import { nowTime } from "@/time";
import {
	getWeaponByType,
	toWeaponState,
	type WeaponType,
} from "@/weapon";
import {
	attack,
	attackSideEvents,
} from "@/weapon/Attack";
import type { WeaponTier } from "@/weapon/WeaponState";
import {
	combineWeapons,
	toWeaponStateAtTier,
	weaponAtTier,
	weaponPrice,
	weaponStatsForTier,
	weaponTierBasePrice,
} from "@/weapon/WeaponTiers";
import {
	brick,
	doubleBarrelShotgun,
	fist,
	hand,
	sword,
} from "./index";
// Reference: https://brotato.wiki.spellsandguns.com/Weapons (2026-10-17).
const reference: {
	id: WeaponType;
	damage: number[];
	cooldown: number[];
	crit: number[];
	critMultiplier: number[];
	price: number[];
	scaling: number[];
	stat:
		| "rangedDamage"
		| "meleeDamage";
	range: number;
	knockback: number;
	min?: number;
}[] =
	[
		{
			id: "pistol",
			damage:
				[
					12,
					20,
					30,
					50,
				],
			cooldown:
				[
					1.2,
					1.12,
					1.03,
					0.87,
				],
			crit: [
				10,
				15,
				20,
				25,
			],
			critMultiplier:
				[
					2,
					2,
					2,
					2,
				],
			price:
				[
					10,
					22,
					45,
					91,
				],
			scaling:
				[
					1,
					1,
					1,
					1,
				],
			stat: "rangedDamage",
			range: 400,
			knockback: 15,
		},
		{
			id: "smg",
			damage:
				[
					3,
					4,
					5,
					8,
				],
			cooldown:
				[
					0.17,
					0.17,
					0.17,
					0.15,
				],
			crit: [
				1,
				1,
				1,
				1,
			],
			critMultiplier:
				[
					1.5,
					1.5,
					1.5,
					1.5,
				],
			price:
				[
					20,
					39,
					74,
					149,
				],
			scaling:
				[
					0.5,
					0.6,
					0.7,
					0.8,
				],
			stat: "rangedDamage",
			range: 400,
			knockback: 0,
		},
		{
			id: "laserGun",
			damage:
				[
					40,
					55,
					70,
					100,
				],
			cooldown:
				[
					1.98,
					1.9,
					1.82,
					1.65,
				],
			crit: [
				3,
				3,
				3,
				3,
			],
			critMultiplier:
				[
					2,
					2,
					2,
					2,
				],
			price:
				[
					15,
					31,
					61,
					122,
				],
			scaling:
				[
					4,
					4.5,
					5,
					6,
				],
			stat: "rangedDamage",
			range: 500,
			knockback: 0,
		},
		{
			id: "hand",
			damage:
				[
					1,
					1,
					1,
					1,
				],
			cooldown:
				[
					1.01,
					0.93,
					0.86,
					0.71,
				],
			crit: [
				1,
				1,
				1,
				1,
			],
			critMultiplier:
				[
					1.5,
					1.5,
					1.5,
					1.5,
				],
			price:
				[
					10,
					22,
					45,
					91,
				],
			scaling:
				[
					0.5,
					0.5,
					0.5,
					0.5,
				],
			stat: "meleeDamage",
			range: 150,
			knockback: 30,
		},
		{
			id: "fist",
			damage:
				[
					8,
					16,
					32,
					64,
				],
			cooldown:
				[
					0.78,
					0.73,
					0.69,
					0.59,
				],
			crit: [
				1,
				1,
				1,
				1,
			],
			critMultiplier:
				[
					1.5,
					1.5,
					1.5,
					1.5,
				],
			price:
				[
					10,
					22,
					45,
					91,
				],
			scaling:
				[
					1,
					1,
					1,
					1,
				],
			stat: "meleeDamage",
			range: 150,
			knockback: 15,
		},
		{
			id: "knife",
			damage:
				[
					9,
					13,
					18,
					25,
				],
			cooldown:
				[
					1.01,
					0.93,
					0.86,
					0.78,
				],
			crit: [
				20,
				30,
				40,
				50,
			],
			critMultiplier:
				[
					2.5,
					3,
					3.5,
					4,
				],
			price:
				[
					10,
					22,
					45,
					91,
				],
			scaling:
				[
					0.8,
					0.8,
					0.8,
					0.8,
				],
			stat: "meleeDamage",
			range: 150,
			knockback: 2,
		},
		{
			id: "sword",
			min: 2,
			damage:
				[
					30,
					45,
					65,
				],
			cooldown:
				[
					1.28,
					1.13,
					0.98,
				],
			crit: [
				3,
				3,
				3,
			],
			critMultiplier:
				[
					2,
					2,
					2,
				],
			price:
				[
					51,
					95,
					190,
				],
			scaling:
				[
					1,
					1,
					1,
				],
			stat: "meleeDamage",
			range: 200,
			knockback: 5,
		},
		{
			id: "doubleBarrelShotgun",
			damage:
				[
					3,
					6,
					9,
					9,
				],
			cooldown:
				[
					1.37,
					1.28,
					1.2,
					1.2,
				],
			crit: [
				3,
				3,
				3,
				3,
			],
			critMultiplier:
				[
					2,
					2,
					2,
					2,
				],
			price:
				[
					20,
					39,
					74,
					149,
				],
			scaling:
				[
					0.8,
					0.85,
					0.9,
					1,
				],
			stat: "rangedDamage",
			range: 350,
			knockback: 8,
		},
		{
			id: "brick",
			damage:
				[
					30,
					60,
					90,
					120,
				],
			cooldown:
				[
					1.39,
					1.39,
					1.39,
					1.39,
				],
			crit: [
				3,
				3,
				3,
				3,
			],
			critMultiplier:
				[
					1.5,
					1.5,
					1.5,
					1.5,
				],
			price:
				[
					6,
					14,
					22,
					40,
				],
			scaling:
				[
					0.5,
					0.65,
					0.8,
					1,
				],
			stat: "meleeDamage",
			range: 150,
			knockback: 5,
		},
	];
for (const row of reference)
	describe(`${row.id} Brotato progression`, () => {
		for (
			let i = 0;
			i <
			row
				.damage
				.length;
			i++
		) {
			const tier =
				(i +
					(row.min ??
						1)) as WeaponTier;
			it(`uses reference combat stats and price at tier ${tier}`, () => {
				const definition =
					getWeaponByType(
						row.id,
					);
				const state =
					toWeaponStateAtTier(
						definition,
						tier,
					);
				expect(
					state.statsBonus,
				).toMatchObject(
					{
						damage:
							row
								.damage[
								i
							],
						cooldown:
							row
								.cooldown[
								i
							],
						range:
							row.range,
						knockback:
							row.knockback,
						critChance:
							row
								.crit[
								i
							],
						critMultiplier:
							row
								.critMultiplier[
								i
							],
						scaling:
							{
								[row.stat]:
									row
										.scaling[
										i
									],
							},
					},
				);
				expect(
					weaponAtTier(
						definition,
						tier,
					)
						.statsBonus,
				).toEqual(
					state.statsBonus,
				);
				expect(
					weaponTierBasePrice(
						definition,
						tier,
					),
				).toBe(
					row
						.price[
						i
					]!,
				);
				expect(
					weaponPrice(
						definition,
						tier,
						10,
					),
				).toBe(
					2 *
						row
							.price[
							i
						]! +
						10,
				);
				if (
					tier <
					4
				) {
					const other =
						toWeaponStateAtTier(
							definition,
							tier,
						);
					const combined =
						combineWeapons(
							[
								state,
								other,
							],
							state.id,
							other.id,
						)!;
					expect(
						combined[0]!
							.statsBonus,
					).toEqual(
						toWeaponStateAtTier(
							definition,
							(tier +
								1) as WeaponTier,
						)
							.statsBonus,
					);
				}
			});
		}
	});
const spawn =
	() =>
		spawnBulbro(
			"test",
			"normal",
			zeroPoint(),
			0,
			0,
			{
				...wellRoundedBulbro,
				statBonuses:
					{},
			},
		);
it("uses both melee and engineering for Brick at every tier", () => {
	const player =
		spawn().withStatSource(
			{
				id: "damage",
				kind: "item",
				bonuses:
					{
						meleeDamage: 10,
						engineering: 40,
					},
			},
		);
	for (const [
		tier,
		damage,
	] of [
		[
			1,
			55,
		],
		[
			2,
			93,
		],
		[
			3,
			130,
		],
		[
			4,
			170,
		],
	] as const)
		expect(
			calculateAttackDamage(
				player,
				toWeaponStateAtTier(
					brick,
					tier,
				),
				"player",
				() =>
					0.99,
			),
		).toBe(
			damage,
		);
});
it("emits separately aimed shotgun pellets with per-pellet damage", () => {
	for (const [
		tier,
		count,
		damage,
	] of [
		[
			1,
			4,
			3,
		],
		[
			2,
			4,
			6,
		],
		[
			3,
			4,
			9,
		],
		[
			4,
			6,
			9,
		],
	] as const) {
		const weapon =
			toWeaponStateAtTier(
				doubleBarrelShotgun,
				tier,
			);
		const player =
			spawn().useWeapons(
				[
					weapon,
				],
			);
		const result =
			attack(
				player,
				"player",
				weapon,
				{
					id: "enemy",
					aimAt:
						{
							x: 300,
							y: 0,
						},
				},
				nowTime(
					1000,
				),
				() =>
					0.99,
			)!;
		const events =
			attackSideEvents(
				weapon.id,
				result,
			);
		expect(
			events,
		).toHaveLength(
			count,
		);
		expect(
			new Set(
				events.map(
					(
						e,
					) =>
						e
							.shot
							.id,
				),
			)
				.size,
		).toBe(
			count,
		);
		expect(
			new Set(
				events.map(
					(
						e,
					) =>
						e
							.shot
							.direction
							.y,
				),
			)
				.size,
		).toBe(
			count,
		);
		expect(
			events.map(
				(
					e,
				) =>
					e
						.shot
						.damage,
			),
		).toEqual(
			Array(
				count,
			).fill(
				damage,
			),
		);
	}
});
it("adds Hand harvesting once through combining, serialization and removal", () => {
	const first =
			toWeaponState(
				hand,
			),
		second =
			toWeaponState(
				hand,
			),
		backup =
			toWeaponState(
				fist,
			);
	const player =
		spawn().useWeapons(
			[
				first,
				second,
				backup,
			],
		);
	expect(
		player
			.stats
			.harvesting,
	).toBe(
		6,
	);
	const combined =
		player.useWeapons(
			combineWeapons(
				player.weapons,
				first.id,
				second.id,
			)!,
		);
	expect(
		combined
			.stats
			.harvesting,
	).toBe(
		6,
	);
	const restored =
		new BulbroState(
			JSON.parse(
				JSON.stringify(
					combined,
				),
			),
		);
	expect(
		restored
			.stats
			.harvesting,
	).toBe(
		6,
	);
	expect(
		restored.harvest()
			.materialsAvailable,
	).toBe(
		6,
	);
	expect(
		restored.useWeapons(
			[
				backup,
			],
		)
			.stats
			.harvesting,
	).toBe(
		0,
	);
	expect(
		weaponStatsForTier(
			hand,
			4,
		)
			.harvesting,
	).toBe(
		25,
	);
});
it("starts Sword at tier II and never offers or constructs a tier-I Sword", () => {
	expect(
		toWeaponState(
			sword,
		)
			.tier,
	).toBe(
		2,
	);
	expect(
		() =>
			toWeaponStateAtTier(
				sword,
				1,
			),
	).toThrow();
	expect(
		() =>
			weaponAtTier(
				sword,
				1,
			),
	).toThrow();
	expect(
		() =>
			weaponPrice(
				sword,
				1,
				1,
			),
	).toThrow();
	const pool =
		{
			...wellRoundedBulbro,
			availableWeapons:
				[
					sword,
				],
		};
	expect(
		generateWeaponShopItems(
			pool,
			{
				wave: 1,
				random:
					() =>
						0,
			},
		),
	).toEqual(
		[],
	);
	expect(
		generateWeaponShopItems(
			pool,
			{
				wave: 2,
				random:
					() =>
						0,
			},
		)[0],
	).toMatchObject(
		{
			tier: 2,
			price: 63,
		},
	);
});
