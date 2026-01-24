import type { Bulbro } from "@/bulbro/BulbroCharacter";
import type { ShopItem } from "@/shop/Shop";
import type { Weapon } from "@/weapon";

/**
 * Base prices for different weapon classes (normalized to wave 1).
 * These are relative values that get scaled by wave/level.
 */
const WEAPON_CLASS_BASE_PRICES: Record<
	string,
	number
> =
	{
		blade: 1.5,
		blunt: 1.2,
		elemental: 3.0,
		explosive: 2.5,
		gun: 1.8,
		heavy: 2.2,
		precise: 1.0,
		support: 2.0,
		tool: 0.8,
		unarmed: 0.5,
	};

/**
 * Weights for different stats when calculating weapon value.
 * Higher weights mean the stat contributes more to the price.
 */
const STAT_PRICE_WEIGHTS: Record<
	string,
	number
> =
	{
		damage: 0.8,
		meleeDamage: 0.6,
		rangedDamage: 0.6,
		elementalDamage: 1.0,
		attackSpeed: 5.0,
		range: 0.01,
		critChance: 1.5,
		knockback: 0.3,
		maxHp: 0.2,
		hpRegeneration: 0.15,
		lifeSteal: 2.0,
		armor: 0.4,
		dodge: 1.0,
		speed: 0.6,
		luck: 0.4,
		harvesting: 0.2,
		engineering: 0.3,
		pickupRange: 0.05,
	};

/**
 * Price range configuration for different waves.
 * Prices scale from minPrice at wave 1 to grow with each wave.
 */
const PRICE_CONFIG =
	{
		/** Minimum price at wave 1 */
		minPrice: 10,
		/** Maximum price at wave 1 for the most expensive items */
		maxPriceWave1: 50,
		/** Price multiplier per wave (compound growth) */
		waveMultiplier: 1.15,
		/** Price multiplier per bulbro level */
		levelMultiplier: 1.1,
	};

/**
 * Calculates the raw power value of a weapon (0-1 scale relative to other weapons).
 */
function calculateWeaponPower(
	weapon: Weapon,
): number {
	// Get base power from weapon classes (use highest class value)
	const classPower =
		Math.max(
			...weapon.classes.map(
				(
					cls,
				) =>
					WEAPON_CLASS_BASE_PRICES[
						cls
					] ??
					1.0,
			),
		);

	// Calculate stat bonus value
	let statValue = 0;
	for (const [
		stat,
		value,
	] of Object.entries(
		weapon.statsBonus,
	)) {
		const weight =
			STAT_PRICE_WEIGHTS[
				stat
			] ??
			0.1;
		statValue +=
			value *
			weight;
	}

	// Shot speed modifier (faster weapons are more valuable)
	// Normalize around 1000ms (1 shot/sec)
	const shotSpeedModifier =
		weapon.shotSpeed >
		0
			? 1000 /
				weapon.shotSpeed
			: 1;

	return (
		classPower +
		statValue *
			shotSpeedModifier
	);
}

/**
 * Calculates the price of a weapon based on its stats, wave, and level.
 *
 * The price formula:
 * 1. Calculate raw weapon power (based on stats and classes)
 * 2. Normalize to a 0-1 scale
 * 3. Map to price range for wave 1 ($10-$50)
 * 4. Scale by wave and level multipliers
 *
 * @param weapon - The weapon to calculate price for
 * @param wave - Current wave number (1-based)
 * @param level - Bulbro level (1-based)
 * @returns The calculated price in materials
 */
export function calculateWeaponPrice(
	weapon: Weapon,
	wave: number = 1,
	level: number = 1,
): number {
	const power =
		calculateWeaponPower(
			weapon,
		);

	// Normalize power to 0-1 range (empirically, power ranges from ~1 to ~15)
	const normalizedPower =
		Math.min(
			Math.max(
				(power -
					1) /
					14,
				0,
			),
			1,
		);

	// Map to wave 1 price range
	const {
		minPrice,
		maxPriceWave1,
		waveMultiplier,
		levelMultiplier,
	} =
		PRICE_CONFIG;
	const basePriceRange =
		maxPriceWave1 -
		minPrice;
	const basePrice =
		minPrice +
		normalizedPower *
			basePriceRange;

	// Apply wave scaling (compound growth)
	const waveScaling =
		waveMultiplier **
		(wave -
			1);

	// Apply level scaling
	const levelScaling =
		levelMultiplier **
		(level -
			1);

	// Calculate final price
	const finalPrice =
		basePrice *
		waveScaling *
		levelScaling;

	// Round to nearest 5 for cleaner prices
	return (
		Math.round(
			finalPrice /
				5,
		) *
		5
	);
}

/**
 * Options for generating shop items.
 */
export interface GenerateShopItemsOptions {
	/** Weapons to exclude (e.g., already owned weapons) */
	excludeOwned?: Weapon[];
	/** Maximum number of items to include in shop */
	maxItems?: number;
	/** Current wave number (1-based, default: 1) */
	wave?: number;
	/** Bulbro level (1-based, default: 1) */
	level?: number;
}

/**
 * Generates shop items for a Bulbro character.
 *
 * This function creates a list of ShopItems from the Bulbro's available weapons,
 * calculating appropriate prices based on weapon stats, wave, and level.
 *
 * Price ranges:
 * - Wave 1, Level 1: $10-$50
 * - Prices grow ~15% per wave and ~10% per level
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
		excludeOwned = [],
		maxItems,
		wave = 1,
		level = 1,
	} = options;

	// Get IDs of weapons to exclude
	const excludedIds =
		new Set(
			excludeOwned.map(
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
						calculateWeaponPrice(
							weapon,
							wave,
							level,
						),
				}),
			);

	// Sort by price (cheapest first) for better UX
	shopItems.sort(
		(
			a,
			b,
		) =>
			a.price -
			b.price,
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
