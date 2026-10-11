import { itemPrice } from "@/game-formulas";
import {
	getWeaponByType,
	toWeaponState,
	type Weapon,
} from "@/weapon";
import type {
	WeaponState,
	WeaponStats,
	WeaponTier,
} from "./WeaponState";

export const minWeaponTier: WeaponTier = 1;
export const maxWeaponTier: WeaponTier = 4;

/** Weapon damage multiplier per tier (Brotato's Pistol: 12/20/30/50 damage) */
export const weaponTierDamageMultipliers: Record<
	WeaponTier,
	number
> =
	{
		1: 1,
		2: 1.6,
		3: 2.4,
		4: 3.6,
	};

/** Weapon cooldown multiplier per tier (Brotato's Pistol: 1.2/1.12/1.03/0.87s) */
export const weaponTierCooldownMultipliers: Record<
	WeaponTier,
	number
> =
	{
		1: 1,
		2: 0.93,
		3: 0.85,
		4: 0.75,
	};

/** Crit chance (%) added per tier above I */
export const weaponTierCritChanceBonus = 3;

/**
 * Price multiplier per tier: a weapon is worth the two weapons of the lower
 * tier it is combined from.
 */
export const weaponTierPriceMultipliers: Record<
	WeaponTier,
	number
> =
	{
		1: 1,
		2: 2,
		3: 4,
		4: 8,
	};

/** Share of a weapon's current shop price paid back when it is sold (Brotato: 25%) */
export const weaponSellShare = 0.25;

export function weaponTierOf(
	weapon: Pick<
		WeaponState,
		"tier"
	>,
): WeaponTier {
	return (
		weapon.tier ??
		minWeaponTier
	);
}

export function nextWeaponTier(
	tier: WeaponTier,
):
	| WeaponTier
	| undefined {
	return tier <
		maxWeaponTier
		? ((tier +
				1) as WeaponTier)
		: undefined;
}

/**
 * Weapon stats at a tier. Higher tiers deal more damage, attack faster and
 * crit more often; range, knockback, explosion and damage scaling stay.
 * Damage grows by at least 1 per tier, so weak weapons gain from tiers too.
 */
export function weaponStatsForTier(
	stats: WeaponStats,
	tier: WeaponTier,
): WeaponStats {
	if (
		tier ===
		minWeaponTier
	)
		return stats;
	const tiered: WeaponStats =
		{
			...stats,
		};
	if (
		stats.damage
	) {
		tiered.damage =
			Math.max(
				stats.damage +
					tier -
					1,
				Math.round(
					stats.damage *
						weaponTierDamageMultipliers[
							tier
						],
				),
			);
	}
	if (
		stats.cooldown !==
		undefined
	) {
		tiered.cooldown =
			Math.round(
				stats.cooldown *
					weaponTierCooldownMultipliers[
						tier
					] *
					100,
			) /
			100;
	}
	tiered.critChance =
		(stats.critChance ??
			0) +
		weaponTierCritChanceBonus *
			(tier -
				1);
	return tiered;
}

/** The weapon definition with its stats at a tier */
export function weaponAtTier(
	weapon: Weapon,
	tier: WeaponTier,
): Weapon {
	return {
		...weapon,
		statsBonus:
			weaponStatsForTier(
				weapon.statsBonus,
				tier,
			),
	};
}

/** A fresh weapon state of the weapon at a tier */
export function toWeaponStateAtTier(
	weapon: Weapon,
	tier: WeaponTier,
): WeaponState {
	return {
		...toWeaponState(
			weapon,
		),
		statsBonus:
			weaponStatsForTier(
				weapon.statsBonus,
				tier,
			),
		tier,
	};
}

/** Base price of the weapon at a tier, before the wave's price increase */
export function weaponTierBasePrice(
	weapon: Weapon,
	tier: WeaponTier,
): number {
	return (
		weapon.basePrice *
		weaponTierPriceMultipliers[
			tier
		]
	);
}

/** Shop price of the weapon at a tier in a wave */
export function weaponPrice(
	weapon: Weapon,
	tier: WeaponTier,
	wave: number,
	inflation = 1,
): number {
	return itemPrice(
		weaponTierBasePrice(
			weapon,
			tier,
		),
		wave,
		inflation,
	);
}

/** Materials paid back for selling an owned weapon in a wave, at least 1 */
export function weaponSellPrice(
	weapon: Pick<
		WeaponState,
		| "type"
		| "tier"
	>,
	wave: number,
): number {
	return Math.max(
		1,
		Math.floor(
			weaponPrice(
				getWeaponByType(
					weapon.type,
				),
				weaponTierOf(
					weapon,
				),
				wave,
			) *
				weaponSellShare,
		),
	);
}

/** Whether two owned weapons can be combined into one of the next tier */
export function canCombineWeapons(
	weapon: Pick<
		WeaponState,
		| "id"
		| "type"
		| "tier"
	>,
	other: Pick<
		WeaponState,
		| "id"
		| "type"
		| "tier"
	>,
): boolean {
	return (
		weapon.id !==
			other.id &&
		weapon.type ===
			other.type &&
		weaponTierOf(
			weapon,
		) ===
			weaponTierOf(
				other,
			) &&
		nextWeaponTier(
			weaponTierOf(
				weapon,
			),
		) !==
			undefined
	);
}

/** Another owned weapon the weapon can be combined with, if any */
export function findCombinableWeapon(
	weapons: WeaponState[],
	weaponId: string,
):
	| WeaponState
	| undefined {
	const weapon =
		weapons.find(
			(
				w,
			) =>
				w.id ===
				weaponId,
		);
	if (
		!weapon
	)
		return;
	return weapons.find(
		(
			other,
		) =>
			canCombineWeapons(
				weapon,
				other,
			),
	);
}

/**
 * Combines two owned weapons: the first one moves up a tier and keeps its
 * slot, the second one is removed. Returns undefined when they cannot be
 * combined.
 */
export function combineWeapons(
	weapons: WeaponState[],
	weaponId: string,
	consumedWeaponId: string,
):
	| WeaponState[]
	| undefined {
	const weapon =
		weapons.find(
			(
				w,
			) =>
				w.id ===
				weaponId,
		);
	const consumed =
		weapons.find(
			(
				w,
			) =>
				w.id ===
				consumedWeaponId,
		);
	if (
		!weapon ||
		!consumed ||
		!canCombineWeapons(
			weapon,
			consumed,
		)
	)
		return;
	const tier =
		nextWeaponTier(
			weaponTierOf(
				weapon,
			),
		)!;
	const definition =
		getWeaponByType(
			weapon.type,
		);
	return weapons.flatMap(
		(
			w,
		) => {
			if (
				w.id ===
				consumedWeaponId
			)
				return [];
			if (
				w.id !==
				weaponId
			)
				return [
					w,
				];
			return [
				{
					...w,
					tier,
					statsBonus:
						weaponStatsForTier(
							definition.statsBonus,
							tier,
						),
					strike:
						undefined,
				},
			];
		},
	);
}

/** An owned weapon as shown in the shop: its definition with stats at its tier */
export type OwnedWeapon =
	{
		/** Id of the owned weapon state */
		id: string;
		tier: WeaponTier;
		weapon: Weapon;
	};

export function ownedWeaponFromState(
	state: WeaponState,
): OwnedWeapon {
	const tier =
		weaponTierOf(
			state,
		);
	return {
		id: state.id,
		tier,
		weapon:
			weaponAtTier(
				getWeaponByType(
					state.type,
				),
				tier,
			),
	};
}

/** Owned tier I copies of weapon definitions, e.g. for previews */
export function toOwnedWeapons(
	weapons: Weapon[],
): OwnedWeapon[] {
	return weapons.map(
		(
			weapon,
			index,
		) => ({
			id: `${weapon.id}-${index}`,
			tier: minWeaponTier,
			weapon,
		}),
	);
}

/** Another owned weapon the weapon can be combined with, if any */
export function findCombinableOwnedWeapon(
	weapons: OwnedWeapon[],
	weapon: OwnedWeapon,
):
	| OwnedWeapon
	| undefined {
	return weapons.find(
		(
			other,
		) =>
			canCombineWeapons(
				{
					id: weapon.id,
					type: weapon
						.weapon
						.id,
					tier: weapon.tier,
				},
				{
					id: other.id,
					type: other
						.weapon
						.id,
					tier: other.tier,
				},
			),
	);
}
