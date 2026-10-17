import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	appearanceHeadroom,
	appearanceKey,
	characterWearableAppearances,
	itemAppearances,
	resolveAppearance,
	wearableFrame,
} from "./ItemAppearance";
import { findItemById } from "./Items";

describe("itemAppearances", () => {
	it("only references existing items with artwork in their atlas", () => {
		for (const [
			itemId,
			appearance,
		] of Object.entries(
			itemAppearances,
		)) {
			expect(
				findItemById(
					itemId,
				),
			).toBeDefined();
			expect(
				wearableFrame(
					appearance,
					itemId,
				),
			).toBeDefined();
		}
	});

	it("covers the head items", () => {
		expect(
			Object.keys(
				itemAppearances,
			).sort(),
		).toEqual(
			[
				"beanie",
				"bowlerHat",
				"helmet",
				"propellerHat",
				"warriorHelmet",
				"wolfHelmet",
			],
		);
	});
});

describe("characterWearableAppearances", () => {
	it("has artwork for every character accessory", () => {
		for (const [
			wearingItem,
			appearance,
		] of Object.entries(
			characterWearableAppearances,
		)) {
			expect(
				wearableFrame(
					appearance!,
					wearingItem,
				),
			).toBeDefined();
		}
	});
});

describe("resolveAppearance", () => {
	it("shows the character accessory without head items", () => {
		expect(
			resolveAppearance(
				[
					"acid",
				],
				[
					"crown",
				],
			)
				.head
				?.itemId,
		).toBe(
			"crown",
		);
	});

	it("replaces the character accessory with a bought head item", () => {
		expect(
			resolveAppearance(
				[
					"beanie",
				],
				[
					"crown",
				],
			)
				.head
				?.itemId,
		).toBe(
			"beanie",
		);
	});

	it("ignores character accessories without artwork", () => {
		expect(
			resolveAppearance(
				[],
				[
					"medic",
				],
			),
		).toEqual(
			{},
		);
	});

	it("is empty without wearable items", () => {
		expect(
			resolveAppearance(
				[
					"acid",
					"unknown",
				],
			),
		).toEqual(
			{},
		);
	});

	it("shows only the most recently bought item per slot", () => {
		const appearance =
			resolveAppearance(
				[
					"beanie",
					"acid",
					"helmet",
				],
			);
		expect(
			appearance
				.head
				?.itemId,
		).toBe(
			"helmet",
		);
	});
});

describe("appearanceKey", () => {
	it("changes only when the visible items change", () => {
		const beanie =
			appearanceKey(
				resolveAppearance(
					[
						"beanie",
					],
				),
			);
		expect(
			appearanceKey(
				resolveAppearance(
					[
						"beanie",
						"acid",
					],
				),
			),
		).toBe(
			beanie,
		);
		expect(
			appearanceKey(
				resolveAppearance(
					[
						"beanie",
						"helmet",
					],
				),
			),
		).not.toBe(
			beanie,
		);
	});
});

describe("appearanceHeadroom", () => {
	it("is zero without wearables", () => {
		expect(
			appearanceHeadroom(
				{},
			),
		).toBe(
			0,
		);
	});

	it("is the height of a hat above the body top", () => {
		const beanie =
			itemAppearances.beanie!;
		expect(
			appearanceHeadroom(
				resolveAppearance(
					[
						"beanie",
					],
				),
			),
		).toBe(
			(128 *
				beanie.scale) /
				2 -
				beanie
					.offset
					.y,
		);
	});

	it("uses the bounding box of a rotated wearable", () => {
		const bowlerHat =
			itemAppearances.bowlerHat!;
		const headroom =
			appearanceHeadroom(
				{
					head: {
						itemId:
							"bowlerHat",
						appearance:
							{
								...bowlerHat,
								rotation:
									Math.PI /
									4,
							},
					},
				},
			);
		// A square 128px frame rotated 45deg is sqrt(2) times taller
		expect(
			headroom,
		).toBeCloseTo(
			(128 *
				Math.SQRT2 *
				bowlerHat.scale) /
				2 -
				bowlerHat
					.offset
					.y,
		);
	});
});
