import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	type BulbroState,
	spawnBulbro,
} from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions";
import {
	type GameEventInternal,
	withEventMeta,
} from "@/game-events/GameEvents";
import { itemPrice } from "@/game-formulas";
import { zeroPoint } from "@/geometry";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { toWeaponState } from "@/weapon";
import {
	pistol,
	smg,
	sword,
	weapons,
} from "@/weapons-definitions";
import {
	canCombineWeapons,
	combineWeapons,
	findCombinableOwnedWeapon,
	ownedWeaponFromState,
	toOwnedWeapons,
	toWeaponStateAtTier,
	weaponPrice,
	weaponSellPrice,
	weaponStatsForTier,
} from "./WeaponTiers";

function spawnWith(
	...weaponStates: ReturnType<
		typeof toWeaponState
	>[]
) {
	return spawnBulbro(
		"test",
		"normal",
		zeroPoint(),
		0,
		0,
		wellRoundedBulbro,
	).useWeapons(
		weaponStates,
	);
}

function apply(
	state: BulbroState,
	event: GameEventInternal,
) {
	return state.applyEvent(
		withEventMeta(
			event,
			deltaTime(
				0,
			),
			nowTime(
				1000,
			),
		),
	);
}

describe("weapon tier stats", () => {
	it("keeps tier I stats as defined", () => {
		expect(
			weaponStatsForTier(
				pistol.statsBonus,
				1,
			),
		).toEqual(
			pistol.statsBonus,
		);
	});

	it("raises damage, attack speed and crit chance on every tier", () => {
		for (const weapon of weapons) {
			let previous =
				weapon.statsBonus;
			for (const tier of [
				2,
				3,
				4,
			] as const) {
				const stats =
					weaponStatsForTier(
						weapon.statsBonus,
						tier,
					);
				expect(
					stats.damage ??
						0,
				).toBeGreaterThan(
					previous.damage ??
						0,
				);
				expect(
					stats.cooldown!,
				).toBeLessThan(
					previous.cooldown!,
				);
				expect(
					stats.critChance!,
				).toBeGreaterThan(
					previous.critChance ??
						0,
				);
				expect(
					stats.range,
				).toBe(
					weapon
						.statsBonus
						.range,
				);
				expect(
					stats.scaling,
				).toEqual(
					weapon
						.statsBonus
						.scaling,
				);
				previous =
					stats;
			}
		}
	});

	it("gives weak weapons at least 1 damage per tier", () => {
		expect(
			[
				2,
				3,
				4,
			].map(
				(
					tier,
				) =>
					weaponStatsForTier(
						smg.statsBonus,
						tier as
							| 2
							| 3
							| 4,
					)
						.damage,
			),
		).toEqual(
			[
				2,
				3,
				4,
			],
		);
	});

	it("does not change the shared weapon definition", () => {
		const before =
			JSON.stringify(
				sword.statsBonus,
			);
		toWeaponStateAtTier(
			sword,
			4,
		);
		expect(
			JSON.stringify(
				sword.statsBonus,
			),
		).toBe(
			before,
		);
	});
});

describe("weapon prices", () => {
	it("doubles the price with every tier", () => {
		expect(
			weaponPrice(
				pistol,
				1,
				1,
			),
		).toBe(
			itemPrice(
				pistol.basePrice,
				1,
				1,
			),
		);
		expect(
			weaponPrice(
				pistol,
				3,
				1,
			),
		).toBe(
			itemPrice(
				pistol.basePrice *
					4,
				1,
				1,
			),
		);
	});

	it("pays back a quarter of the current price when selling", () => {
		// Pistol: base 15, wave 5 → 15 + 5 + 7.5 = 27; tier II → 30 + 5 + 15 = 50
		expect(
			weaponSellPrice(
				{
					type: "pistol",
				},
				5,
			),
		).toBe(
			6,
		);
		expect(
			weaponSellPrice(
				{
					type: "pistol",
					tier: 2,
				},
				5,
			),
		).toBe(
			12,
		);
	});
});

describe("combining weapons", () => {
	it("combines two equal weapons of the same tier into the next tier", () => {
		const first =
			toWeaponState(
				pistol,
			);
		const second =
			toWeaponState(
				pistol,
			);
		const other =
			toWeaponState(
				sword,
			);
		const combined =
			combineWeapons(
				[
					first,
					other,
					second,
				],
				first.id,
				second.id,
			)!;
		expect(
			combined.map(
				(
					w,
				) => [
					w.id,
					w.tier ??
						1,
				],
			),
		).toEqual(
			[
				[
					first.id,
					2,
				],
				[
					other.id,
					1,
				],
			],
		);
		expect(
			combined[0]!
				.statsBonus,
		).toEqual(
			weaponStatsForTier(
				pistol.statsBonus,
				2,
			),
		);
	});

	it("refuses different weapons, different tiers, the same weapon and tier IV", () => {
		const pistolI =
			toWeaponState(
				pistol,
			);
		expect(
			canCombineWeapons(
				pistolI,
				toWeaponState(
					sword,
				),
			),
		).toBe(
			false,
		);
		expect(
			canCombineWeapons(
				pistolI,
				toWeaponStateAtTier(
					pistol,
					2,
				),
			),
		).toBe(
			false,
		);
		expect(
			canCombineWeapons(
				pistolI,
				pistolI,
			),
		).toBe(
			false,
		);
		expect(
			canCombineWeapons(
				toWeaponStateAtTier(
					pistol,
					4,
				),
				toWeaponStateAtTier(
					pistol,
					4,
				),
			),
		).toBe(
			false,
		);
	});

	it("finds a combinable owned weapon", () => {
		const owned =
			toOwnedWeapons(
				[
					pistol,
					sword,
					pistol,
				],
			);
		expect(
			findCombinableOwnedWeapon(
				owned,
				owned[0]!,
			)
				?.id,
		).toBe(
			owned[2]!
				.id,
		);
		expect(
			findCombinableOwnedWeapon(
				owned,
				owned[1]!,
			),
		).toBeUndefined();
	});

	it("shows owned weapons with their tier stats", () => {
		const owned =
			ownedWeaponFromState(
				toWeaponStateAtTier(
					pistol,
					3,
				),
			);
		expect(
			owned.tier,
		).toBe(
			3,
		);
		expect(
			owned
				.weapon
				.statsBonus,
		).toEqual(
			weaponStatsForTier(
				pistol.statsBonus,
				3,
			),
		);
	});
});

describe("BulbroState weapon events", () => {
	it("sells a weapon for materials", () => {
		const sold =
			toWeaponState(
				pistol,
			);
		const kept =
			toWeaponState(
				sword,
			);
		const state =
			apply(
				spawnWith(
					sold,
					kept,
				),
				{
					type: "weaponSold",
					playerId:
						"test",
					weaponId:
						sold.id,
					price: 6,
				},
			);
		expect(
			state.weapons.map(
				(
					w,
				) =>
					w.id,
			),
		).toEqual(
			[
				kept.id,
			],
		);
		expect(
			state.materialsAvailable,
		).toBe(
			6,
		);
	});

	it("does not sell the last weapon, unknown weapons or for an invalid price", () => {
		const weapon =
			toWeaponState(
				pistol,
			);
		const single =
			spawnWith(
				weapon,
			);
		expect(
			apply(
				single,
				{
					type: "weaponSold",
					playerId:
						"test",
					weaponId:
						weapon.id,
					price: 6,
				},
			),
		).toBe(
			single,
		);
		const pair =
			spawnWith(
				weapon,
				toWeaponState(
					sword,
				),
			);
		for (const event of [
			{
				weaponId:
					"missing",
				price: 6,
			},
			{
				weaponId:
					weapon.id,
				price:
					-1,
			},
			{
				weaponId:
					weapon.id,
				price:
					Number.NaN,
			},
		]) {
			expect(
				apply(
					pair,
					{
						type: "weaponSold",
						playerId:
							"test",
						...event,
					},
				),
			).toBe(
				pair,
			);
		}
	});

	it("combines two weapons into a higher tier", () => {
		const first =
			toWeaponState(
				smg,
			);
		const second =
			toWeaponState(
				smg,
			);
		const state =
			apply(
				spawnWith(
					first,
					second,
				),
				{
					type: "weaponsCombined",
					playerId:
						"test",
					weaponId:
						first.id,
					consumedWeaponId:
						second.id,
				},
			);
		expect(
			state.weapons,
		).toHaveLength(
			1,
		);
		expect(
			state
				.weapons[0]!
				.tier,
		).toBe(
			2,
		);
		expect(
			state
				.weapons[0]!
				.statsBonus
				.damage,
		).toBe(
			2,
		);
	});

	it("ignores combining weapons of another player or that cannot be combined", () => {
		const first =
			toWeaponState(
				smg,
			);
		const second =
			toWeaponState(
				pistol,
			);
		const state =
			spawnWith(
				first,
				second,
			);
		expect(
			apply(
				state,
				{
					type: "weaponsCombined",
					playerId:
						"test",
					weaponId:
						first.id,
					consumedWeaponId:
						second.id,
				},
			),
		).toBe(
			state,
		);
		expect(
			apply(
				state,
				{
					type: "weaponsCombined",
					playerId:
						"other",
					weaponId:
						first.id,
					consumedWeaponId:
						first.id,
				},
			),
		).toBe(
			state,
		);
	});

	it("keeps weapon tiers through serialization", () => {
		const state =
			spawnWith(
				toWeaponStateAtTier(
					pistol,
					3,
				),
			);
		const restored =
			JSON.parse(
				JSON.stringify(
					state,
				),
			);
		expect(
			restored
				.weapons[0]
				.tier,
		).toBe(
			3,
		);
	});
});
