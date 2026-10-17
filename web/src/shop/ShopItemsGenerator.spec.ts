import {
	describe,
	expect,
	it,
} from "bun:test";
import { wellRoundedBulbro } from "@/characters-definitions";
import { seededRng } from "@/random";
import {
	weaponPrice,
	weaponStatsForTier,
} from "@/weapon/WeaponTiers";
import { pistol } from "@/weapons-definitions";
import {
	generateShopItems,
	generateWeaponShopItems,
} from "./ShopItemsGenerator";

function weaponIds(
	seed: number,
) {
	return generateWeaponShopItems(
		wellRoundedBulbro,
		{
			maxItems: 4,
			random:
				seededRng(
					seed,
				),
		},
	).map(
		(
			item,
		) =>
			item
				.weapon
				.id,
	);
}

describe("generateWeaponShopItems", () => {
	it("picks distinct weapons within a single roll", () => {
		const ids =
			weaponIds(
				1,
			);
		expect(
			ids,
		).toHaveLength(
			Math.min(
				4,
				wellRoundedBulbro
					.availableWeapons
					.length,
			),
		);
		expect(
			new Set(
				ids,
			)
				.size,
		).toBe(
			ids.length,
		);
	});

	it("produces different rolls for different random sources", () => {
		const rolls =
			new Set(
				Array.from(
					{
						length: 20,
					},
					(
						_,
						seed,
					) =>
						weaponIds(
							seed,
						).join(),
				),
			);
		expect(
			rolls.size,
		).toBeGreaterThan(
			1,
		);
	});

	it("keeps offering owned weapons", () => {
		const items =
			generateWeaponShopItems(
				wellRoundedBulbro,
			);
		expect(
			items,
		).toHaveLength(
			wellRoundedBulbro.availableWeapons.filter(
				(
					w,
				) =>
					(w.minTier ??
						1) ===
					1,
			)
				.length,
		);
	});
});

it("gates weapon tiers by wave and prices their upgraded stats", () => {
	for (const [
		wave,
		tier,
	] of [
		[
			1,
			1,
		],
		[
			2,
			2,
		],
		[
			3,
			2,
		],
		[
			4,
			3,
		],
		[
			7,
			3,
		],
		[
			8,
			4,
		],
	] as const) {
		const offers =
			generateWeaponShopItems(
				wellRoundedBulbro,
				{
					wave,
					random:
						() =>
							0,
				},
			);
		expect(
			offers.length,
		).toBeGreaterThan(
			0,
		);
		for (const offer of offers) {
			const definition =
				wellRoundedBulbro.availableWeapons.find(
					(
						w,
					) =>
						w.id ===
						offer
							.weapon
							.id,
				)!;
			expect(
				offer.tier,
			).toBe(
				tier,
			);
			expect(
				offer.price,
			).toBe(
				weaponPrice(
					definition,
					tier,
					wave,
				),
			);
			expect(
				offer
					.weapon
					.statsBonus,
			).toEqual(
				weaponStatsForTier(
					definition,
					tier,
				),
			);
		}
	}
});

it("uses shopping luck and respects character pools and exclusions", () => {
	const bulbro =
		{
			...wellRoundedBulbro,
			availableWeapons:
				[
					pistol,
				],
		};
	expect(
		generateWeaponShopItems(
			bulbro,
			{
				wave: 2,
				random:
					() =>
						0.1,
			},
		)[0]
			?.tier,
	).toBe(
		1,
	);
	expect(
		generateWeaponShopItems(
			bulbro,
			{
				wave: 2,
				luck: 100,
				random:
					() =>
						0.1,
			},
		)[0]
			?.tier,
	).toBe(
		2,
	);
	expect(
		generateWeaponShopItems(
			bulbro,
			{
				wave: 20,
				excludeWeapons:
					[
						pistol,
					],
			},
		),
	).toEqual(
		[],
	);
	const mixed =
		generateShopItems(
			bulbro,
			{
				wave: 8,
				items:
					[],
				luck: 50,
				random:
					() =>
						0,
			},
		);
	expect(
		mixed,
	).toHaveLength(
		1,
	);
	expect(
		mixed[0],
	).toMatchObject(
		{
			weapon:
				{
					id: "pistol",
				},
			tier: 4,
		},
	);
});
