import {
	describe,
	expect,
	it,
} from "bun:test";
import type { GameEventInternal } from "@/game-events/GameEvents";
import { withEventMeta } from "@/game-events/GameEvents";
import { zeroPoint } from "@/geometry";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { wellRoundedBulbro } from "../characters-definitions/";
import type { Bulbro } from "./BulbroCharacter";
import {
	BulbroState,
	spawnBulbro,
} from "./BulbroState";

function spawn(
	statBonuses: Bulbro["statBonuses"] = {},
) {
	return spawnBulbro(
		"test",
		"normal",
		zeroPoint(),
		0,
		0,
		{
			...wellRoundedBulbro,
			statBonuses,
		},
	);
}

function apply(
	state: BulbroState,
	event:
		| GameEventInternal
		| undefined,
	at = 1000,
) {
	if (
		!event
	)
		throw new Error(
			"expected an event",
		);
	return state.applyEvent(
		withEventMeta(
			event,
			deltaTime(
				16,
			),
			nowTime(
				at,
			),
		),
	);
}

function withHealthPoints(
	state: BulbroState,
	healthPoints: number,
) {
	return new BulbroState(
		{
			...state.toJSON(),
			healthPoints,
		},
	);
}

const always =
	() =>
		0;
const never =
	() =>
		0.999;

describe("BulbroState", () => {
	it("should instantiate without errors", () => {
		expect(
			spawn(),
		).toBeInstanceOf(
			BulbroState,
		);
	});

	describe("stats", () => {
		it("computes stats from the character stat source", () => {
			const state =
				spawn(
					{
						damage: 60,
						maxHp: 5,
					},
				);
			expect(
				state.statSources,
			).toEqual(
				[
					{
						id: "character",
						kind: "character",
						bonuses:
							{
								damage: 60,
								maxHp: 5,
							},
					},
				],
			);
			expect(
				state
					.stats
					.damage,
			).toBe(
				60,
			);
			expect(
				state
					.stats
					.maxHp,
			).toBe(
				15,
			);
			expect(
				state.healthPoints,
			).toBe(
				15,
			);
		});

		it("moves with the speed stat", () => {
			const state =
				spawn(
					{
						speed: 10,
					},
				);
			expect(
				state.speed,
			).toBe(
				state
					.stats
					.speed,
			);
		});

		it("replaces a stat source with the same id and recomputes stats", () => {
			const state =
				spawn(
					{
						armor: 1,
					},
				)
					.withStatSource(
						{
							id: "item",
							kind: "item",
							bonuses:
								{
									armor: 2,
								},
						},
					)
					.withStatSource(
						{
							id: "item",
							kind: "item",
							bonuses:
								{
									armor: 5,
								},
						},
					);
			expect(
				state.statSources,
			).toHaveLength(
				2,
			);
			expect(
				state
					.stats
					.armor,
			).toBe(
				6,
			);
		});
	});

	describe("beHit", () => {
		it("reduces the damage by armor", () => {
			expect(
				spawn(
					{
						armor: 15,
					},
				).beHit(
					4,
					nowTime(
						0,
					),
					never,
				),
			).toEqual(
				{
					type: "bulbroReceivedHit",
					bulbroId:
						"test",
					damage: 2,
				},
			);
		});

		it("increases the damage with negative armor", () => {
			expect(
				spawn(
					{
						armor:
							-15,
					},
				).beHit(
					4,
					nowTime(
						0,
					),
					never,
				)
					?.damage,
			).toBe(
				8,
			);
		});

		it("dodges hits with the dodge chance", () => {
			const dodger =
				spawn(
					{
						dodge: 30,
					},
				);
			expect(
				dodger.beHit(
					4,
					nowTime(
						0,
					),
					() =>
						0.29,
				),
			).toBeUndefined();
			expect(
				dodger.beHit(
					4,
					nowTime(
						0,
					),
					() =>
						0.3,
				),
			).toBeDefined();
		});

		it("caps dodge at 60%", () => {
			expect(
				spawn(
					{
						dodge: 100,
					},
				).beHit(
					4,
					nowTime(
						0,
					),
					() =>
						0.6,
				),
			).toBeDefined();
		});

		it("never dodges without dodge", () => {
			expect(
				spawn().beHit(
					4,
					nowTime(
						0,
					),
					always,
				),
			).toBeDefined();
		});
	});

	describe("HP regeneration", () => {
		it("does not regenerate without HP regeneration", () => {
			const hurt =
				withHealthPoints(
					spawn(),
					5,
				);
			expect(
				hurt.healByHpRegeneration(
					nowTime(
						10_000,
					),
				),
			).toBe(
				hurt,
			);
		});

		it("regenerates for the time since the last heal", () => {
			const hurt =
				withHealthPoints(
					spawn(
						{
							hpRegeneration: 1,
						},
					),
					5,
				);
			expect(
				hurt.healByHpRegeneration(
					nowTime(
						5_000,
					),
				),
			).toEqual(
				{
					type: "bulbroHealed",
					bulbroId:
						"test",
					hp: 1,
					source:
						"regeneration",
				},
			);
		});
	});

	describe("life steal", () => {
		it("heals 1 HP with the life steal chance", () => {
			const vampire =
				withHealthPoints(
					spawn(
						{
							lifeSteal: 10,
						},
					),
					5,
				);
			expect(
				vampire.stealLife(
					nowTime(
						1000,
					),
					() =>
						0.09,
				),
			).toEqual(
				{
					type: "bulbroHealed",
					bulbroId:
						"test",
					hp: 1,
					source:
						"lifeSteal",
				},
			);
			expect(
				vampire.stealLife(
					nowTime(
						1000,
					),
					() =>
						0.1,
				),
			).toBeUndefined();
		});

		it("does not steal life at full health", () => {
			expect(
				spawn(
					{
						lifeSteal: 100,
					},
				).stealLife(
					nowTime(
						1000,
					),
					always,
				),
			).toBeUndefined();
		});

		it("heals at most 10 times per second", () => {
			const vampire =
				withHealthPoints(
					spawn(
						{
							lifeSteal: 100,
						},
					),
					5,
				);
			const healed =
				apply(
					vampire,
					vampire.stealLife(
						nowTime(
							1000,
						),
						always,
					),
					1000,
				);
			expect(
				healed.healthPoints,
			).toBe(
				6,
			);
			expect(
				healed.stealLife(
					nowTime(
						1099,
					),
					always,
				),
			).toBeUndefined();
			expect(
				healed.stealLife(
					nowTime(
						1100,
					),
					always,
				),
			).toBeDefined();
		});

		it("does not delay HP regeneration", () => {
			const vampire =
				withHealthPoints(
					spawn(
						{
							lifeSteal: 100,
						},
					),
					5,
				);
			const healed =
				apply(
					vampire,
					vampire.stealLife(
						nowTime(
							1000,
						),
						always,
					),
					1000,
				);
			expect(
				healed.healedByHpRegenerationAt,
			).toBe(
				vampire.healedByHpRegenerationAt,
			);
		});
	});

	describe("experience", () => {
		it("levels up when collecting materials", () => {
			let state =
				spawn();
			for (
				let i = 0;
				i <
				16;
				i++
			) {
				state =
					apply(
						state,
						{
							type: "materialCollected",
							materialId: `${i}`,
							playerId:
								"test",
						},
					);
			}
			expect(
				state.totalExperience,
			).toBe(
				16,
			);
			expect(
				state.materialsAvailable,
			).toBe(
				16,
			);
			expect(
				state.level,
			).toBe(
				1,
			);
		});

		it("shares pickups collected by another player", () => {
			const state =
				apply(
					spawn(),
					{
						type: "materialCollected",
						materialId:
							"m1",
						playerId:
							"someone-else",
					},
				);
			expect(
				state.materialsAvailable,
			).toBe(
				1,
			);
			expect(
				state.totalExperience,
			).toBe(
				1,
			);
		});

		it("shares pickups with a dead Bulbro", () => {
			const dead =
				apply(
					spawn(),
					{
						type: "bulbroDied",
						bulbroId:
							"test",
						damage: 10,
						position:
							zeroPoint(),
					},
				);
			expect(
				dead.isAlive(),
			).toBe(
				false,
			);
			const state =
				apply(
					dead,
					{
						type: "materialCollected",
						materialId:
							"m1",
						playerId:
							"someone-else",
					},
				);
			expect(
				state.materialsAvailable,
			).toBe(
				1,
			);
			expect(
				state.totalExperience,
			).toBe(
				1,
			);
		});

		it("gives one material per pickup regardless of harvesting", () => {
			const state =
				apply(
					spawn(
						{
							harvesting: 50,
						},
					),
					{
						type: "materialCollected",
						materialId:
							"m1",
						playerId:
							"test",
					},
				);
			expect(
				state.materialsAvailable,
			).toBe(
				1,
			);
		});

		it("spawns at the level reached with the experience", () => {
			expect(
				spawnBulbro(
					"test",
					"normal",
					zeroPoint(),
					0,
					41,
					wellRoundedBulbro,
				)
					.level,
			).toBe(
				2,
			);
		});
	});

	describe("harvest", () => {
		it("gives harvesting materials and experience", () => {
			const harvested =
				spawn(
					{
						harvesting: 8,
					},
				).harvest();
			expect(
				harvested.materialsAvailable,
			).toBe(
				8,
			);
			expect(
				harvested.totalExperience,
			).toBe(
				8,
			);
		});

		it("grows harvesting by 5% (rounded up) every wave", () => {
			const once =
				spawn(
					{
						harvesting: 20,
					},
				).harvest();
			expect(
				once
					.stats
					.harvesting,
			).toBe(
				21,
			);
			const twice =
				once.harvest();
			// 5% of 21 is 1.05, rounded up to 2
			expect(
				twice
					.stats
					.harvesting,
			).toBe(
				23,
			);
			expect(
				twice.materialsAvailable,
			).toBe(
				20 +
					21,
			);
			expect(
				twice.statSources.filter(
					(
						s,
					) =>
						s.kind ===
						"harvestingGrowth",
				),
			).toHaveLength(
				1,
			);
		});

		it("rounds small growth up to 1", () => {
			expect(
				spawn(
					{
						harvesting: 8,
					},
				).harvest()
					.stats
					.harvesting,
			).toBe(
				9,
			);
		});

		it("takes materials and experience with negative harvesting", () => {
			const state =
				spawn(
					{
						harvesting:
							-3,
					},
				).gainMaterials(
					10,
				);
			const harvested =
				state.harvest();
			expect(
				harvested.materialsAvailable,
			).toBe(
				7,
			);
			expect(
				harvested.totalExperience,
			).toBe(
				7,
			);
			expect(
				harvested
					.stats
					.harvesting,
			).toBe(
				-3,
			);
		});

		it("never loses a level or goes below zero materials", () => {
			const state =
				spawn(
					{
						harvesting:
							-10,
					},
				).gainMaterials(
					18,
				);
			expect(
				state.level,
			).toBe(
				1,
			);
			const harvested =
				state.harvest();
			expect(
				harvested.level,
			).toBe(
				1,
			);
			expect(
				harvested.totalExperience,
			).toBe(
				16,
			);
			expect(
				harvested.materialsAvailable,
			).toBe(
				8,
			);
			expect(
				harvested.harvest()
					.materialsAvailable,
			).toBe(
				0,
			);
		});

		it("does nothing without harvesting", () => {
			const state =
				spawn();
			expect(
				state.harvest(),
			).toBe(
				state,
			);
		});
	});
});

describe("weapon capacity", () => {
	it("rejects a seventh weapon without changing the loadout", async () => {
		const {
			smg,
		} =
			await import(
				"@/weapons-definitions"
			);
		const {
			toWeaponState,
		} =
			await import(
				"@/weapon"
			);
		const weapons =
			Array.from(
				{
					length: 6,
				},
				() =>
					toWeaponState(
						smg,
					),
			);
		const full =
			spawn().useWeapons(
				weapons,
			);
		expect(
			full.weapons,
		).toHaveLength(
			6,
		);
		expect(
			() =>
				full.useWeapons(
					[
						...weapons,
						toWeaponState(
							smg,
						),
					],
				),
		).toThrow(
			"Weapon limit",
		);
		expect(
			full.weapons,
		).toHaveLength(
			6,
		);
		expect(
			full.useWeapons(
				weapons.slice(
					0,
					5,
				),
			)
				.weapons,
		).toHaveLength(
			5,
		);
	});
	it("honors lower and higher custom capacities when spawning and equipping", async () => {
		const {
			smg,
		} =
			await import(
				"@/weapons-definitions"
			);
		const {
			toWeaponState,
		} =
			await import(
				"@/weapon"
			);
		const weapons =
			Array.from(
				{
					length: 7,
				},
				() =>
					toWeaponState(
						smg,
					),
			);
		expect(
			spawn(
				{
					maxWeapons: 1,
				},
			).useWeapons(
				weapons,
			)
				.weapons,
		).toHaveLength(
			7,
		);
		expect(
			() =>
				spawn(
					{
						maxWeapons:
							-5,
					},
				).useWeapons(
					weapons.slice(
						0,
						2,
					),
				),
		).toThrow(
			"Weapon limit",
		);
		expect(
			() =>
				spawnBulbro(
					"test",
					"normal",
					zeroPoint(),
					0,
					0,
					{
						...wellRoundedBulbro,
						weapons:
							Array(
								7,
							).fill(
								smg,
							),
					},
				),
		).toThrow(
			"Weapon limit",
		);
	});
});
