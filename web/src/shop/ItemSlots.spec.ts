import {
	afterEach,
	expect,
	it,
	mock,
} from "bun:test";
import {
	h,
	render,
} from "preact";
import { act } from "preact/test-utils";
import { findItemById } from "@/items/Items";
import { requireDefined } from "@/requireDefined";

mock.module(
	"@/ui/PixiApp",
	() => ({
		PixiApp:
			() =>
				null,
	}),
);
const container =
	document.createElement(
		"div",
	);
afterEach(
	() =>
		render(
			null,
			container,
		),
);

const acid =
	requireDefined(
		findItemById(
			"acid",
		),
	);
const glasses =
	requireDefined(
		findItemById(
			"glasses",
		),
	);

it("groups copies of the same item", async () => {
	const {
		groupItems,
	} =
		await import(
			"./ItemSlots"
		);
	expect(
		groupItems(
			[
				acid,
				glasses,
				acid,
			],
		).map(
			({
				item,
				count,
			}) => [
				item.id,
				count,
			],
		),
	).toEqual(
		[
			[
				"acid",
				2,
			],
			[
				"glasses",
				1,
			],
		],
	);
});

it("shows the effect of a selected item and its total for several copies", async () => {
	const {
		ItemSlots,
	} =
		await import(
			"./ItemSlots"
		);
	act(
		() =>
			render(
				h(
					ItemSlots,
					{
						items:
							[
								acid,
								glasses,
								acid,
							],
					},
				),
				container,
			),
	);

	const tiles =
		[
			...container.querySelectorAll(
				"button",
			),
		];
	expect(
		tiles.map(
			(
				tile,
			) =>
				tile.getAttribute(
					"aria-label",
				),
		),
	).toEqual(
		[
			"Acid",
			"Glasses",
		],
	);
	expect(
		container.querySelector(
			"section",
		),
	).toBeNull();
	expect(
		container.textContent,
	).toContain(
		"Select an item to see its effect",
	);

	act(
		() =>
			requireDefined(
				tiles[0],
			).click(),
	);
	const details =
		container.querySelector(
			"section",
		);
	expect(
		requireDefined(
			tiles[0],
		).getAttribute(
			"aria-pressed",
		),
	).toBe(
		"true",
	);
	expect(
		details?.textContent,
	).toContain(
		"Acid ×2",
	);
	expect(
		details?.textContent,
	).toContain(
		"+8 Max HP",
	);
	expect(
		details?.textContent,
	).toContain(
		"Total (2 copies)",
	);
	expect(
		details?.textContent,
	).toContain(
		"+16 Max HP",
	);
	expect(
		details?.textContent,
	).toContain(
		"-4% Dodge",
	);

	act(
		() =>
			requireDefined(
				tiles[1],
			).click(),
	);
	const glassesDetails =
		container.querySelector(
			"section",
		);
	expect(
		glassesDetails?.textContent,
	).toContain(
		"+20 Range",
	);
	expect(
		glassesDetails?.textContent,
	).not.toContain(
		"Total",
	);

	act(
		() =>
			requireDefined(
				tiles[1],
			).click(),
	);
	expect(
		container.querySelector(
			"section",
		),
	).toBeNull();
});

it("shows an empty state without items", async () => {
	const {
		ItemSlots,
	} =
		await import(
			"./ItemSlots"
		);
	act(
		() =>
			render(
				h(
					ItemSlots,
					{
						items:
							[],
					},
				),
				container,
			),
	);
	expect(
		container.textContent,
	).toContain(
		"No items yet",
	);
	expect(
		container.querySelector(
			"button",
		),
	).toBeNull();
});
