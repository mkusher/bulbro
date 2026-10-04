import {
	afterEach,
	expect,
	it,
} from "bun:test";
import {
	h,
	render,
} from "preact";
import { act } from "preact/test-utils";
import { wellRoundedBulbro } from "@/characters-definitions";
import { smg } from "@/weapons-definitions";
import { useStartingLoadout } from "./useStartingLoadout";

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

it("requires every slot, permits duplicate weapons and resets on character changes", () => {
	let loadout!: ReturnType<
		typeof useStartingLoadout
	>;
	function Setup() {
		loadout =
			useStartingLoadout(
				wellRoundedBulbro,
			);
		return null;
	}
	act(
		() =>
			render(
				h(
					Setup,
					{},
				),
				container,
			),
	);
	expect(
		loadout.isValid,
	).toBe(
		false,
	);
	act(
		() =>
			loadout.selectWeapon(
				0,
				smg,
			),
	);
	expect(
		loadout.isValid,
	).toBe(
		true,
	);
	act(
		() =>
			loadout.selectBulbro(
				{
					...wellRoundedBulbro,
					statBonuses:
						{
							startingWeapons: 1,
						},
				},
			),
	);
	expect(
		loadout.selections,
	).toEqual(
		[
			null,
			null,
		],
	);
	act(
		() =>
			loadout.selectWeapon(
				0,
				smg,
			),
	);
	expect(
		loadout.isValid,
	).toBe(
		false,
	);
	act(
		() =>
			loadout.selectWeapon(
				1,
				smg,
			),
	);
	expect(
		loadout.isValid,
	).toBe(
		true,
	);
	expect(
		loadout.weapons,
	).toEqual(
		[
			smg,
			smg,
		],
	);
	act(
		() =>
			loadout.selectWeapon(
				0,
				null,
			),
	);
	expect(
		loadout.isValid,
	).toBe(
		false,
	);
	act(
		() =>
			loadout.selectBulbro(
				{
					...wellRoundedBulbro,
					availableWeapons:
						[],
					defaultWeapons:
						[
							smg,
						],
				},
			),
	);
	expect(
		loadout.selections,
	).toEqual(
		[
			null,
		],
	);
	expect(
		loadout.isValid,
	).toBe(
		false,
	);
});

it("counts built-in weapons and rejects impossible starting limits", () => {
	let loadout!: ReturnType<
		typeof useStartingLoadout
	>;
	function Setup() {
		loadout =
			useStartingLoadout(
				{
					...wellRoundedBulbro,
					weapons:
						[
							smg,
						],
				},
				smg,
			);
		return null;
	}
	act(
		() =>
			render(
				h(
					Setup,
					{},
				),
				container,
			),
	);
	expect(
		loadout.selections,
	).toEqual(
		[],
	);
	expect(
		loadout.isValid,
	).toBe(
		true,
	);
	act(
		() =>
			loadout.selectBulbro(
				{
					...wellRoundedBulbro,
					statBonuses:
						{
							startingWeapons: 2,
							maxWeapons:
								-4,
						},
				},
			),
	);
	expect(
		loadout.selections,
	).toEqual(
		[],
	);
	expect(
		loadout.isValid,
	).toBe(
		false,
	);
});
