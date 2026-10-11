import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	BulbroState,
	spawnBulbro,
} from "@/bulbro/BulbroState";
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
	it("starts with an explicit empty inventory", () => {
		const state =
			spawn();
		expect(
			state.items,
		).toEqual(
			[],
		);
		expect(
			state.toJSON()
				.items,
		).toEqual(
			[],
		);
	});

	it("adds items immutably and combines their bonuses with character and upgrade stats", () => {
		const original =
			spawn().withStatSource(
				{
					id: "upgrade-armor",
					kind: "upgrade",
					bonuses:
						{
							armor: 2,
						},
				},
			);
		const upgraded =
			original
				.withItem(
					"helmet",
				)
				.withItem(
					"helmet",
				)
				.withItem(
					"glassCannon",
				);
		expect(
			original.items,
		).toEqual(
			[],
		);
		expect(
			original
				.stats
				.armor,
		).toBe(
			2,
		);
		expect(
			upgraded.items,
		).toEqual(
			[
				"helmet",
				"helmet",
				"glassCannon",
			],
		);
		expect(
			upgraded
				.stats
				.armor,
		).toBe(
			1,
		);
		expect(
			upgraded
				.stats
				.damage,
		).toBe(
			original
				.stats
				.damage +
				25,
		);
		expect(
			upgraded
				.stats
				.speed,
		).toBeCloseTo(
			original
				.stats
				.speed -
				baseStats.speed *
					0.04,
		);
		expect(
			upgraded.materialsAvailable,
		).toBe(
			original.materialsAvailable,
		);
		expect(
			upgraded.gainMaterials(
				1,
			)
				.items,
		).toEqual(
			upgraded.items,
		);
		expect(
			upgraded.withItem(
				"unknown",
			),
		).toBe(
			upgraded,
		);
	});

	it("caps current health after a max HP penalty without healing for a max HP bonus", () => {
		const original =
			spawn();
		const penalized =
			original.withItem(
				"injection",
			);
		expect(
			penalized
				.stats
				.maxHp,
		).toBe(
			original
				.stats
				.maxHp -
				2,
		);
		expect(
			penalized.healthPoints,
		).toBe(
			penalized
				.stats
				.maxHp,
		);
		expect(
			penalized.withItem(
				"cake",
			)
				.healthPoints,
		).toBe(
			penalized.healthPoints,
		);
		expect(
			original.healthPoints,
		).toBe(
			original
				.stats
				.maxHp,
		);
	});

	it("rejects purchases with insufficient funds or invalid prices without changing items or stats", () => {
		const state =
			spawn(
				10,
			);
		for (const price of [
			11,
			-1,
			Number.NaN,
			Number.POSITIVE_INFINITY,
		]) {
			expect(
				buyItem(
					state,
					"helmet",
					price,
				),
			).toBe(
				state,
			);
		}
		const purchased =
			buyItem(
				state,
				"helmet",
				10,
			);
		expect(
			purchased.materialsAvailable,
		).toBe(
			0,
		);
		expect(
			purchased.items,
		).toEqual(
			[
				"helmet",
			],
		);
	});

	it("ignores purchases for another player", () => {
		const state =
			spawn();
		expect(
			state.applyEvent(
				withEventMeta(
					{
						type: "shopPurchased",
						playerId:
							"other",
						itemId:
							"helmet",
						price: 10,
					},
					deltaTime(
						0,
					),
					nowTime(
						1000,
					),
				),
			),
		).toBe(
			state,
		);
	});

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
		expect(
			json.items,
		).toEqual(
			[
				"potato",
			],
		);
		const restored =
			new BulbroState(
				json,
			);
		expect(
			restored.items,
		).toEqual(
			state.items,
		);
		expect(
			restored.stats,
		).toEqual(
			state.stats,
		);
		const next =
			restored.withItem(
				"potato",
			);
		expect(
			next.items,
		).toEqual(
			[
				"potato",
				"potato",
			],
		);
		expect(
			next
				.stats
				.armor,
		).toBe(
			state
				.stats
				.armor +
				1,
		);
	});

	it("migrates legacy item stat sources once and preserves duplicate copies", () => {
		const state =
			spawn()
				.withItem(
					"helmet",
				)
				.withItem(
					"helmet",
				);
		const {
			items:
				_items,
			...legacy
		} =
			state.toJSON();
		const restored =
			new BulbroState(
				legacy,
			);
		expect(
			restored.items,
		).toEqual(
			[
				"helmet",
				"helmet",
			],
		);
		expect(
			restored.stats,
		).toEqual(
			state.stats,
		);
		const reloaded =
			new BulbroState(
				JSON.parse(
					JSON.stringify(
						restored,
					),
				),
			);
		expect(
			reloaded.items,
		).toEqual(
			restored.items,
		);
		expect(
			reloaded.stats,
		).toEqual(
			restored.stats,
		);
		const next =
			buyItem(
				reloaded,
				"helmet",
			);
		expect(
			next.items,
		).toEqual(
			[
				"helmet",
				"helmet",
				"helmet",
			],
		);
		expect(
			next
				.stats
				.armor,
		).toBe(
			state
				.stats
				.armor +
				1,
		);
		expect(
			next.statSources.filter(
				(
					source,
				) =>
					source.kind ===
					"item",
			),
		).toHaveLength(
			3,
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
