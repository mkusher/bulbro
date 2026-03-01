import type { Bulbro } from "@/bulbro/BulbroCharacter";
import { itemPrice } from "@/game-formulas";
import type { ShopItem } from "@/shop/Shop";
import type { Weapon } from "@/weapon";

/**
 * Simple seeded pseudo-random number generator (mulberry32).
 * Returns a function that produces deterministic values in [0, 1).
 */
function seededRng(
	seed: number,
): () => number {
	return () => {
		seed |= 0;
		seed =
			(seed +
				0x6d2b79f5) |
			0;
		let t =
			Math.imul(
				seed ^
					(seed >>>
						15),
				1 |
					seed,
			);
		t =
			(t +
				Math.imul(
					t ^
						(t >>>
							7),
					61 |
						t,
				)) ^
			t;
		return (
			((t ^
				(t >>>
					14)) >>>
				0) /
			4294967296
		);
	};
}

/**
 * Fisher-Yates shuffle using a seeded RNG for deterministic results.
 */
function shuffleArray<
	T,
>(
	array: T[],
	seed: number,
): void {
	const rng =
		seededRng(
			seed,
		);
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
				array[
					j
				]!,
				array[
					i
				]!,
			];
	}
}

/**
 * Options for generating shop items.
 */
export interface GenerateShopItemsOptions {
	/** Weapons to exclude (e.g., already owned weapons) */
	excludeWeapons?: Weapon[];
	/** Maximum number of items to include in shop */
	maxItems?: number;
	/** Current wave number (1-based, default: 1) */
	wave?: number;
	/** Re-roll count for shuffling items (0 = first display) */
	rerollCount?: number;
	/** Inflation multiplier for prices (default: 1) */
	inflation?: number;
}

/**
 * Generates shop items for a Bulbro character.
 *
 * This function creates a list of ShopItems from the Bulbro's available weapons,
 * calculating appropriate prices using each weapon's basePrice and the itemPrice formula.
 *
 * @param bulbro - The Bulbro character to generate shop items for
 * @param options - Optional configuration
 * @returns Array of ShopItems with weapons and calculated prices
 */
export function generateShopItems(
	bulbro: Bulbro,
	options: GenerateShopItemsOptions = {},
): ShopItem[] {
	const {
		excludeWeapons = [],
		maxItems,
		wave = 1,
		rerollCount = 0,
		inflation = 1,
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
	const shopItems: ShopItem[] =
		bulbro.availableWeapons
			.filter(
				(
					weapon,
				) =>
					!excludedIds.has(
						weapon.id,
					),
			)
			.map(
				(
					weapon,
				) => ({
					weapon,
					price:
						itemPrice(
							weapon.basePrice,
							wave,
							inflation,
						),
				}),
			);

	// Shuffle items using rerollCount as seed
	shuffleArray(
		shopItems,
		rerollCount,
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
