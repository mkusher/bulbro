import {
	expect,
	it,
} from "bun:test";
import {
	bulbros,
	medic,
} from "../characters-definitions";
import { generateWeaponShopItems } from "../shop/ShopItemsGenerator";
import {
	ak47,
	bazooka,
	fist,
	hand,
	pistol,
} from "../weapons-definitions";
import { availableStartingWeapons } from "./startingWeapons";

for (const character of bulbros) {
	it(`${character.name} has the intended starting and shop weapon pools`, () => {
		const starting =
			availableStartingWeapons(
				character,
			);
		expect(
			starting,
		).not.toContain(
			bazooka,
		);
		expect(
			starting.includes(
				ak47,
			),
		).toBe(
			character.id ===
				"grandpa",
		);
		const shop =
			generateWeaponShopItems(
				character,
			).map(
				(
					item,
				) =>
					item.weapon,
			);
		expect(
			shop.includes(
				ak47,
			),
		).toBe(
			character.id !==
				"medic",
		);
		expect(
			shop.includes(
				bazooka,
			),
		).toBe(
			character.id !==
				"medic",
		);
	});
}
it("preserves Medic's limited starting choices", () => {
	expect(
		availableStartingWeapons(
			medic,
		),
	).toEqual(
		[
			pistol,
			hand,
			fist,
		],
	);
});
