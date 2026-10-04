import {
	describe,
	expect,
	it,
} from "bun:test";
import type { BulbroState } from "@/bulbro/BulbroState";
import { spawnBulbro } from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions";
import { withEventMeta } from "@/game-events/GameEvents";
import { baseStats } from "@/game-formulas";
import { zeroPoint } from "@/geometry";
import en from "@/i18n/locales/en";
import { seededRng } from "@/random";
import { isItemShopItem } from "@/shop/Shop";
import { generateShopItems } from "@/shop/ShopItemsGenerator";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	findItemById,
	itemDefinitions,
	itemIdFromStatSourceId,
	itemStatSourceId,
	rollItemTier,
} from "./Items";

function spawn(
	materials = 1000,
) {
	return spawnBulbro(
		"test",
		"normal",
		zeroPoint(),
		0,
		0,
		wellRoundedBulbro,
	).gainMaterials(
		materials,
	);
}

function buyItem(
	state: BulbroState,
	itemId: string,
	price = 10,
) {
	return state.applyEvent(
		withEventMeta(
			{
				type: "shopPurchased",
				playerId:
					state.id,
				itemId,
				price,
			},
			deltaTime(
				0,
			),
			nowTime(
				1000,
			),
		),
	);
}

describe("item definitions", () => {
	it("has unique ids with localized names", () => {
		const ids =
			itemDefinitions.map(
				(
					item,
				) =>
					item.id,
			);
		expect(
			new Set(
				ids,
			)
				.size,
		).toBe(
			ids.length,
		);
		for (const item of itemDefinitions) {
			expect(
				item.nameKey,
			).toBe(
				`item.name.${item.id}` as typeof item.nameKey,
			);
			expect(
				en[
					item
						.nameKey
				],
			).toBeString();
		}
	});

	it("only changes known stats with a positive price", () => {
		for (const item of itemDefinitions) {
			expect(
				item.basePrice,
			).toBeGreaterThan(
				0,
			);
			expect(
				Object.keys(
					item.bonuses,
				)
					.length,
			).toBeGreaterThan(
				0,
			);
			for (const key of Object.keys(
				item.bonuses,
			)) {
				expect(
					Object.hasOwn(
						baseStats,
						key,
					),
				).toBe(
					true,
				);
			}
		}
	});

	it("offers every tier", () => {
		expect(
			new Set(
				itemDefinitions.map(
					(
						item,
					) =>
						item.tier,
				),
			),
		).toEqual(
			new Set(
				[
					1,
					2,
					3,
					4,
				],
			),
		);
	});

	it("finds an item by id", () => {
		expect(
			findItemById(
				"glassCannon",
			)
				?.bonuses,
		).toEqual(
			{
				damage: 25,
				armor:
					-3,
			},
		);
		expect(
			findItemById(
				"unknown",
			),
		).toBeUndefined();
	});

	it("round trips item ids through stat source ids", () => {
		expect(
			itemIdFromStatSourceId(
				itemStatSourceId(
					"helmet",
					3,
				),
			),
		).toBe(
			"helmet",
		);
		expect(
			itemIdFromStatSourceId(
				"level-up-1",
			),
		).toBeUndefined();
	});
});

describe("rollItemTier", () => {
	it("rolls tier I with an unlucky roll", () => {
		expect(
			rollItemTier(
				20,
				0,
				() =>
					0.99,
			),
		).toBe(
			1,
		);
	});

	it("rolls only tiers available on the wave", () => {
		expect(
			rollItemTier(
				1,
				0,
				() =>
					0,
			),
		).toBe(
			2,
		);
		expect(
			rollItemTier(
				30,
				0,
				() =>
					0,
			),
		).toBe(
			4,
		);
	});
});

describe("buying items", () => {
	it("applies item stats and spends materials", () => {
		const state =
			buyItem(
				spawn(
					100,
				),
				"glassCannon",
				75,
			);
		expect(
			state.materialsAvailable,
		).toBe(
			25,
		);
		expect(
			state.items,
		).toEqual(
			[
				"glassCannon",
			],
		);
		expect(
			state
				.stats
				.damage,
		).toBe(
			spawn()
				.stats
				.damage +
				25,
		);
		expect(
			state
				.stats
				.armor,
		).toBe(
			spawn()
				.stats
				.armor -
				3,
		);
	});

	it("stacks the same item", () => {
		const state =
			buyItem(
				buyItem(
					spawn(),
					"helmet",
				),
				"helmet",
			);
		expect(
			state.items,
		).toEqual(
			[
				"helmet",
				"helmet",
			],
		);
		expect(
			state
				.stats
				.armor,
		).toBe(
			spawn()
				.stats
				.armor +
				2,
		);
	});

	it("ignores unknown items", () => {
		const state =
			spawn();
		expect(
			buyItem(
				state,
				"unknown",
			),
		).toBe(
			state,
		);
	});

	it("keeps items after serialization", () => {
		const state =
			buyItem(
				spawn(),
				"potato",
			);
		const json =
			JSON.parse(
				JSON.stringify(
					state,
				),
			);
		expect(
			json.statSources,
		).toEqual(
			state.statSources,
		);
	});
});

describe("generateShopItems", () => {
	it("offers distinct items priced for the wave", () => {
		const roll =
			generateShopItems(
				wellRoundedBulbro,
				{
					weaponChance: 0,
					random:
						seededRng(
							1,
						),
				},
			);
		expect(
			roll,
		).toHaveLength(
			4,
		);
		const items =
			roll.filter(
				isItemShopItem,
			);
		expect(
			items,
		).toHaveLength(
			4,
		);
		expect(
			new Set(
				items.map(
					(
						i,
					) =>
						i
							.item
							.id,
				),
			)
				.size,
		).toBe(
			4,
		);
		for (const shopItem of items) {
			expect(
				shopItem.price,
			).toBeGreaterThan(
				0,
			);
		}
	});

	it("mixes weapons and items", () => {
		const rolls =
			Array.from(
				{
					length: 20,
				},
				(
					_,
					seed,
				) =>
					generateShopItems(
						wellRoundedBulbro,
						{
							random:
								seededRng(
									seed,
								),
						},
					),
			).flat();
		expect(
			rolls.some(
				isItemShopItem,
			),
		).toBe(
			true,
		);
		expect(
			rolls.some(
				(
					i,
				) =>
					!isItemShopItem(
						i,
					),
			),
		).toBe(
			true,
		);
	});

	it("offers weapons when there are no items", () => {
		const roll =
			generateShopItems(
				wellRoundedBulbro,
				{
					items:
						[],
					random:
						seededRng(
							1,
						),
				},
			);
		expect(
			roll.length,
		).toBeGreaterThan(
			0,
		);
		expect(
			roll.some(
				isItemShopItem,
			),
		).toBe(
			false,
		);
	});
});
