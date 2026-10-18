import type { Bulbro } from "@/bulbro/BulbroCharacter";
import { itemPrice } from "@/game-formulas";
import {
	type ItemDefinition,
	rollItemTier,
	shopItemDefinitions,
} from "@/items/Items";
import { requireDefined } from "@/requireDefined";
import type {
	ItemShopItem,
	ShopItem,
	WeaponShopItem,
} from "@/shop/Shop";
import { shopItemKey } from "@/shop/Shop";
import type { Weapon } from "@/weapon";
import {
	weaponAtTier,
	weaponPrice,
} from "@/weapon/WeaponTiers";

/**
 * Fisher-Yates shuffle using the given RNG.
 */
function shuffleArray<
	T,
>(
	array: T[],
	rng: () => number,
): void {
	for (
		let i =
			array.length -
			1;
		i >
		0;
		i--
	) {
		const j =
			Math.floor(
				rng() *
					(i +
						1),
			);
		[
			array[
				i
			],
			array[
				j
			],
		] =
			[
				requireDefined(
					array[
						j
					],
				),
				requireDefined(
					array[
						i
					],
				),
			];
	}
}

/**
 * Options for generating weapon shop items.
 */
export interface GenerateWeaponShopItemsOptions {
	/** Weapons to exclude (e.g., already owned weapons) */
	excludeWeapons?: Weapon[];
	/** Luck raises the chance of higher weapon tiers. */
	luck?: number;
	/** Maximum number of items to include in shop */
	maxItems?: number;
	/** Current wave number (1-based, default: 1) */
	wave?: number;
	/** Random source in [0, 1) used to pick items (default: Math.random) */
	random?: () => number;
	/** Inflation multiplier for prices (default: 1) */
	inflation?: number;
}

/**
 * Generates weapon shop items for a Bulbro character.
 *
 * This function creates a list of ShopItems from the Bulbro's available weapons,
 * rolling tiers from wave and luck, with tier prices and wave inflation.
 *
 * @param bulbro - The Bulbro character to generate shop items for
 * @param options - Optional configuration
 * @returns Array of ShopItems with weapons and calculated prices
 */
export function generateWeaponShopItems(
	bulbro: Bulbro,
	options: GenerateWeaponShopItemsOptions = {},
): WeaponShopItem[] {
	const {
		excludeWeapons = [],
		maxItems,
		wave = 1,
		random = Math.random,
		inflation = 1,
		luck = 0,
	} = options;

	// Get IDs of weapons to exclude
	const excludedIds =
		new Set(
			excludeWeapons.map(
				(
					w,
				) =>
					w.id,
			),
		);

	// Filter available weapons and calculate prices
	const shopItems: WeaponShopItem[] =
		bulbro.availableWeapons
			.filter(
				(
					weapon,
				) =>
					!excludedIds.has(
						weapon.id,
					),
			)
			.flatMap(
				(
					weapon,
				) => {
					const tier =
						rollItemTier(
							wave,
							luck,
							random,
						);
					if (
						tier <
						(weapon.minTier ??
							1)
					)
						return [];
					return [
						{
							weapon:
								weaponAtTier(
									weapon,
									tier,
								),
							tier,
							price:
								weaponPrice(
									weapon,
									tier,
									wave,
									inflation,
								),
						},
					];
				},
			);

	shuffleArray(
		shopItems,
		random,
	);

	// Limit items if maxItems is specified
	if (
		maxItems !==
			undefined &&
		shopItems.length >
			maxItems
	) {
		return shopItems.slice(
			0,
			maxItems,
		);
	}

	return shopItems;
}

/**
 * Picks an item for a shop slot: rolls a tier for the wave and luck, then a
 * random item of that tier. Falls back to lower tiers, then to any tier, when
 * every item of the rolled tier is already offered.
 */
function pickItem(
	items: ItemDefinition[],
	wave: number,
	luck: number,
	random: () => number,
):
	| ItemDefinition
	| undefined {
	const tier =
		rollItemTier(
			wave,
			luck,
			random,
		);
	const candidates =
		[
			items.filter(
				(
					item,
				) =>
					item.tier ===
					tier,
			),
			items.filter(
				(
					item,
				) =>
					item.tier <
					tier,
			),
			items,
		].find(
			(
				group,
			) =>
				group.length >
				0,
		) ??
		[];
	return candidates[
		Math.floor(
			random() *
				candidates.length,
		)
	];
}

/** Chance of a shop slot to offer a weapon instead of an item. */
export const weaponSlotChance = 0.35;

/**
 * Options for generating shop items.
 */
export interface GenerateShopItemsOptions
	extends GenerateWeaponShopItemsOptions {
	/** Items that can be offered (default: shopItemDefinitions) */
	items?: ItemDefinition[];
	/** Offers carried over with their original prices. */
	lockedItems?: ShopItem[];
	/** Chance of a slot to offer a weapon (default: weaponSlotChance) */
	weaponChance?: number;
}

/**
 * Generates a shop roll for a Bulbro: every slot offers a weapon with
 * `weaponChance`, otherwise an item. Weapons and items are distinct
 * within a roll.
 */
export function generateShopItems(
	bulbro: Bulbro,
	options: GenerateShopItemsOptions = {},
): ShopItem[] {
	const {
		maxItems = 4,
		wave = 1,
		random = Math.random,
		inflation = 1,
		items = shopItemDefinitions,
		luck = 0,
		weaponChance = weaponSlotChance,
		lockedItems = [],
	} = options;
	const lockedKeys =
		new Set(
			lockedItems.map(
				shopItemKey,
			),
		);
	const weapons =
		generateWeaponShopItems(
			bulbro,
			{
				...options,
				maxItems:
					undefined,
				wave,
				random,
				inflation,
			},
		);
	for (
		let i =
			weapons.length -
			1;
		i >=
		0;
		i--
	) {
		if (
			lockedKeys.has(
				shopItemKey(
					requireDefined(
						weapons[
							i
						],
					),
				),
			)
		)
			weapons.splice(
				i,
				1,
			);
	}
	let remainingItems =
		items.filter(
			(
				item,
			) =>
				!lockedKeys.has(
					`item:${item.id}`,
				),
		);
	const shopItems: ShopItem[] =
		[
			...lockedItems,
		];
	for (
		let slot =
			lockedItems.length;
		slot <
		maxItems;
		slot++
	) {
		const offerWeapon =
			weapons.length >
				0 &&
			(remainingItems.length ===
				0 ||
				random() <
					weaponChance);
		if (
			offerWeapon
		) {
			shopItems.push(
				requireDefined(
					weapons.shift(),
				),
			);
			continue;
		}
		const item =
			pickItem(
				remainingItems,
				wave,
				luck,
				random,
			);
		if (
			!item
		)
			break;
		remainingItems =
			remainingItems.filter(
				(
					candidate,
				) =>
					candidate !==
					item,
			);
		const itemShopItem: ItemShopItem =
			{
				item,
				price:
					itemPrice(
						item.basePrice,
						wave,
						inflation,
					),
			};
		shopItems.push(
			itemShopItem,
		);
	}
	return shopItems;
}
