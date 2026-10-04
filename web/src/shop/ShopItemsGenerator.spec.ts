import {
	describe,
	expect,
	it,
} from "bun:test";
import { wellRoundedBulbro } from "@/characters-definitions";
import { seededRng } from "@/random";
import { generateWeaponShopItems } from "./ShopItemsGenerator";

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
			wellRoundedBulbro
				.availableWeapons
				.length,
		);
	});
});
