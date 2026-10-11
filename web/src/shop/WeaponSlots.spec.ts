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
import { toOwnedWeapons } from "@/weapon/WeaponTiers";
import {
	pistol,
	smg,
	sword,
} from "@/weapons-definitions";

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

const buttonWithText =
	(
		text: string,
	) =>
		[
			...container.querySelectorAll(
				"button",
			),
		].find(
			(
				button,
			) =>
				button.textContent?.includes(
					text,
				),
		);

async function renderSlots(
	weapons: Parameters<
		typeof toOwnedWeapons
	>[0],
	disabled = false,
) {
	const {
		WeaponSlots,
	} =
		await import(
			"./WeaponSlots"
		);
	const sell =
		mock(
			() => {},
		);
	const combine =
		mock(
			() => {},
		);
	const owned =
		toOwnedWeapons(
			weapons,
		);
	act(
		() =>
			render(
				h(
					WeaponSlots,
					{
						weapons:
							owned,
						maxSlots: 6,
						sellPrice:
							() =>
								7,
						onSell:
							sell,
						onCombine:
							combine,
						disabled,
					},
				),
				container,
			),
	);
	const select =
		(
			index: number,
		) =>
			act(
				() =>
					(
						container.querySelectorAll(
							"button",
						)[
							index
						] as HTMLButtonElement
					).click(),
			);
	return {
		owned,
		sell,
		combine,
		select,
	};
}

it("sells a selected weapon", async () => {
	const {
		owned,
		sell,
		select,
	} =
		await renderSlots(
			[
				pistol,
				sword,
			],
		);
	expect(
		container.textContent,
	).toContain(
		"Select a weapon to sell or combine it",
	);
	select(
		1,
	);
	expect(
		container.querySelector(
			"section",
		)
			?.textContent,
	).toContain(
		"Tier I",
	);
	act(
		() =>
			buttonWithText(
				"Sell +$7",
			)!.click(),
	);
	expect(
		sell,
	).toHaveBeenCalledWith(
		owned[1],
	);
});

it("does not sell the last weapon", async () => {
	const {
		select,
	} =
		await renderSlots(
			[
				pistol,
			],
		);
	select(
		0,
	);
	expect(
		buttonWithText(
			"Sell",
		)
			?.disabled,
	).toBe(
		true,
	);
});

it("combines a weapon with an equal one of the same tier", async () => {
	const {
		owned,
		combine,
		select,
	} =
		await renderSlots(
			[
				smg,
				sword,
				smg,
			],
		);
	select(
		0,
	);
	act(
		() =>
			buttonWithText(
				"Combine → Tier II",
			)!.click(),
	);
	expect(
		combine,
	).toHaveBeenCalledWith(
		owned[0],
		owned[2],
	);

	select(
		1,
	);
	expect(
		buttonWithText(
			"Combine",
		),
	).toBeUndefined();
	expect(
		container.textContent,
	).toContain(
		"Get another Tier I copy to combine",
	);
});

it("locks selling and combining when disabled", async () => {
	const {
		select,
	} =
		await renderSlots(
			[
				smg,
				smg,
			],
			true,
		);
	select(
		0,
	);
	expect(
		buttonWithText(
			"Sell",
		)
			?.disabled,
	).toBe(
		true,
	);
	expect(
		buttonWithText(
			"Combine",
		)
			?.disabled,
	).toBe(
		true,
	);
});
