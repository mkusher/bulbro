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
import { smg } from "@/weapons-definitions";

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

it("blocks weapon purchases at capacity while still allowing rerolls", async () => {
	const {
		Shop,
	} =
		await import(
			"./Shop"
		);
	const purchase =
		mock(
			() => {},
		);
	const reroll =
		mock(
			() => {},
		);
	const props =
		{
			items:
				[
					{
						weapon:
							smg,
						price: 1,
					},
				],
			availableMaterials: 100,
			onPurchase:
				purchase,
			onReroll:
				reroll,
			rerollPrice: 1,
		};
	act(
		() =>
			render(
				h(
					Shop,
					{
						...props,
						weaponsFull: true,
					},
				),
				container,
			),
	);
	const buttons =
		[
			...container.querySelectorAll(
				"button",
			),
		];
	const buy =
		buttons.find(
			(
				button,
			) =>
				button.textContent?.includes(
					"Weapon limit reached",
				),
		);
	expect(
		buy?.disabled,
	).toBe(
		true,
	);
	act(
		() =>
			buy?.click(),
	);
	expect(
		purchase,
	).not.toHaveBeenCalled();
	const rerollButton =
		buttons.find(
			(
				button,
			) =>
				!button.disabled,
		);
	expect(
		rerollButton,
	).toBeDefined();
	act(
		() =>
			rerollButton?.click(),
	);
	expect(
		reroll,
	).toHaveBeenCalledTimes(
		1,
	);
	act(
		() =>
			render(
				h(
					Shop,
					{
						...props,
						weaponsFull: false,
					},
				),
				container,
			),
	);
	const buyEnabled =
		[
			...container.querySelectorAll(
				"button",
			),
		].at(
			-1,
		)!;
	expect(
		buyEnabled.disabled,
	).toBe(
		false,
	);
	act(
		() =>
			buyEnabled.click(),
	);
	expect(
		purchase,
	).toHaveBeenCalledTimes(
		1,
	);
});

it("allows the same weapon after a reroll until capacity is reached", async () => {
	const {
		Shop,
	} =
		await import(
			"./Shop"
		);
	const purchase =
		mock(
			() => {},
		);
	const showRoll =
		(
			weaponsFull = false,
		) =>
			act(
				() =>
					render(
						h(
							Shop,
							{
								items:
									[
										{
											weapon:
												smg,
											price: 1,
										},
									],
								availableMaterials: 100,
								weaponsFull,
								onPurchase:
									purchase,
							},
						),
						container,
					),
			);
	const buy =
		() =>
			container.querySelector(
				"button",
			);
	showRoll();
	act(
		() =>
			buy()?.click(),
	);
	expect(
		purchase,
	).toHaveBeenCalledTimes(
		1,
	);
	showRoll();
	expect(
		buy()
			?.disabled,
	).toBe(
		false,
	);
	act(
		() =>
			buy()?.click(),
	);
	expect(
		purchase,
	).toHaveBeenCalledTimes(
		2,
	);
	showRoll(
		true,
	);
	expect(
		buy()
			?.disabled,
	).toBe(
		true,
	);
	act(
		() =>
			buy()?.click(),
	);
	expect(
		purchase,
	).toHaveBeenCalledTimes(
		2,
	);
});

it("allows buying items at weapon capacity", async () => {
	const {
		Shop,
	} =
		await import(
			"./Shop"
		);
	const purchase =
		mock(
			() => {},
		);
	const item =
		findItemById(
			"helmet",
		)!;
	act(
		() =>
			render(
				h(
					Shop,
					{
						items:
							[
								{
									item,
									price: 1,
								},
							],
						availableMaterials: 100,
						weaponsFull: true,
						onPurchase:
							purchase,
					},
				),
				container,
			),
	);
	const buy =
		container.querySelector(
			"button",
		)!;
	expect(
		buy.disabled,
	).toBe(
		false,
	);
	act(
		() =>
			buy.click(),
	);
	expect(
		purchase,
	).toHaveBeenCalledTimes(
		1,
	);
});
