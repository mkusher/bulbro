import {
	describe,
	expect,
	it,
} from "bun:test";
import type { BulbroState } from "@/bulbro/BulbroState";
import { spawnBulbro } from "@/bulbro/BulbroState";
import { getTotalExperienceForLevel } from "@/bulbro/Levels";
import { wellRoundedBulbro } from "@/characters-definitions";
import { withEventMeta } from "@/game-events/GameEvents";
import { zeroPoint } from "@/geometry";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	findUpgradeById,
	generateUpgradeChoices,
	guaranteedUpgradeTier,
	levelUpgradeStatSourceId,
	rollUpgradeTier,
	type UpgradeTier,
	upgradeDefinitions,
	upgradeTierChance,
} from "./Upgrades";

function spawn() {
	return spawnBulbro(
		"test",
		"normal",
		zeroPoint(),
		0,
		0,
		{
			...wellRoundedBulbro,
			statBonuses:
				{},
		},
	);
}

function selectUpgrade(
	state: BulbroState,
	level: number,
	upgradeId = "heart",
	tier: UpgradeTier = 1,
) {
	return state.applyEvent(
		withEventMeta(
			{
				type: "upgradeSelected",
				playerId:
					state.id,
				level,
				upgradeId,
				tier,
			},
			deltaTime(
				0,
			),
			nowTime(
				0,
			),
		),
	);
}

describe("upgrade definitions", () => {
	it("has every primary stat except engineering, once", () => {
		const stats =
			upgradeDefinitions.map(
				(
					u,
				) =>
					u.stat,
			);
		expect(
			new Set(
				stats,
			)
				.size,
		).toBe(
			stats.length,
		);
		expect(
			stats,
		).not.toContain(
			"engineering",
		);
		expect(
			stats,
		).toHaveLength(
			15,
		);
	});

	it("finds an upgrade by id", () => {
		expect(
			findUpgradeById(
				"heart",
			)
				?.stat,
		).toBe(
			"maxHp",
		);
		expect(
			findUpgradeById(
				"unknown",
			),
		).toBeUndefined();
	});
});

describe("upgrade tiers", () => {
	it("guarantees tiers on Brotato levels", () => {
		expect(
			guaranteedUpgradeTier(
				1,
			),
		).toBe(
			1,
		);
		expect(
			guaranteedUpgradeTier(
				5,
			),
		).toBe(
			2,
		);
		expect(
			guaranteedUpgradeTier(
				10,
			),
		).toBe(
			3,
		);
		expect(
			guaranteedUpgradeTier(
				15,
			),
		).toBe(
			3,
		);
		expect(
			guaranteedUpgradeTier(
				20,
			),
		).toBe(
			3,
		);
		expect(
			guaranteedUpgradeTier(
				25,
			),
		).toBe(
			4,
		);
		expect(
			guaranteedUpgradeTier(
				30,
			),
		).toBe(
			4,
		);
		expect(
			guaranteedUpgradeTier(
				2,
			),
		).toBeUndefined();
		expect(
			guaranteedUpgradeTier(
				27,
			),
		).toBeUndefined();
	});

	it("rolls the guaranteed tier regardless of the random roll", () => {
		expect(
			rollUpgradeTier(
				5,
				0,
				() =>
					0,
			),
		).toBe(
			2,
		);
		expect(
			rollUpgradeTier(
				1,
				1000,
				() =>
					0,
			),
		).toBe(
			1,
		);
	});

	it("rolls tier I with an unlucky roll", () => {
		expect(
			rollUpgradeTier(
				12,
				0,
				() =>
					0.999,
			),
		).toBe(
			1,
		);
	});

	it("rolls higher tiers when they are available", () => {
		expect(
			rollUpgradeTier(
				2,
				0,
				() =>
					0,
			),
		).toBe(
			2,
		);
		expect(
			rollUpgradeTier(
				3,
				0,
				() =>
					0,
			),
		).toBe(
			3,
		);
		expect(
			rollUpgradeTier(
				7,
				0,
				() =>
					0,
			),
		).toBe(
			4,
		);
	});

	it("scales tier chances with luck and caps them", () => {
		expect(
			upgradeTierChance(
				2,
				3,
				0,
			),
		).toBeCloseTo(
			0.18,
		);
		expect(
			upgradeTierChance(
				2,
				3,
				100,
			),
		).toBeCloseTo(
			0.36,
		);
		expect(
			upgradeTierChance(
				2,
				3,
				-100,
			),
		).toBe(
			0,
		);
		expect(
			upgradeTierChance(
				2,
				100,
				0,
			),
		).toBe(
			0.6,
		);
		expect(
			upgradeTierChance(
				3,
				1,
				0,
			),
		).toBe(
			0,
		);
		expect(
			upgradeTierChance(
				4,
				6,
				0,
			),
		).toBe(
			0,
		);
	});
});

describe("generateUpgradeChoices", () => {
	it("offers 4 distinct upgrades", () => {
		const choices =
			generateUpgradeChoices(
				{
					playerId:
						"p1",
					level: 3,
					luck: 0,
				},
			);
		expect(
			choices,
		).toHaveLength(
			4,
		);
		expect(
			new Set(
				choices.map(
					(
						c,
					) =>
						c
							.upgrade
							.id,
				),
			)
				.size,
		).toBe(
			4,
		);
	});

	it("is stable for the same player and level", () => {
		const options =
			{
				playerId:
					"p1",
				level: 3,
				luck: 0,
			};
		expect(
			generateUpgradeChoices(
				options,
			),
		).toEqual(
			generateUpgradeChoices(
				options,
			),
		);
	});

	it("differs between levels", () => {
		const ids =
			(
				level: number,
			) =>
				generateUpgradeChoices(
					{
						playerId:
							"p1",
						level,
						luck: 0,
					},
				)
					.map(
						(
							c,
						) =>
							`${c.upgrade.id}:${c.tier}`,
					)
					.join();
		const all =
			new Set(
				[
					2,
					3,
					4,
					6,
					7,
					8,
				].map(
					ids,
				),
			);
		expect(
			all.size,
		).toBeGreaterThan(
			1,
		);
	});

	it("uses the guaranteed tier for every choice", () => {
		const choices =
			generateUpgradeChoices(
				{
					playerId:
						"p1",
					level: 10,
					luck: 0,
				},
			);
		expect(
			choices.every(
				(
					c,
				) =>
					c.tier ===
					3,
			),
		).toBe(
			true,
		);
	});
});

describe("level-ups in BulbroState", () => {
	it("has no pending level-ups at level 0", () => {
		const state =
			spawn();
		expect(
			state.pendingLevelUps,
		).toBe(
			0,
		);
		expect(
			state.nextLevelUpLevel,
		).toBe(
			1,
		);
	});

	it("counts every level gained as a pending level-up", () => {
		const state =
			spawn().gainMaterials(
				getTotalExperienceForLevel(
					3,
				),
			);
		expect(
			state.level,
		).toBe(
			3,
		);
		expect(
			state.pendingLevelUps,
		).toBe(
			3,
		);
	});

	it("gives +1 max HP per level and heals it", () => {
		const state =
			spawn();
		const leveled =
			state.gainMaterials(
				getTotalExperienceForLevel(
					2,
				),
			);
		expect(
			leveled
				.stats
				.maxHp,
		).toBe(
			state
				.stats
				.maxHp +
				2,
		);
		expect(
			leveled.healthPoints,
		).toBe(
			state.healthPoints +
				2,
		);
	});

	it("spawns with the level max HP bonus", () => {
		const state =
			spawnBulbro(
				"test",
				"normal",
				zeroPoint(),
				2,
				0,
				{
					...wellRoundedBulbro,
					statBonuses:
						{},
				},
			);
		expect(
			state
				.stats
				.maxHp,
		).toBe(
			spawn()
				.stats
				.maxHp +
				2,
		);
	});

	it("applies the selected upgrade as a stat source, one level at a time", () => {
		let state =
			spawn().gainMaterials(
				getTotalExperienceForLevel(
					2,
				),
			);
		const maxHp =
			state
				.stats
				.maxHp;

		state =
			selectUpgrade(
				state,
				1,
				"heart",
				1,
			);
		expect(
			state
				.stats
				.maxHp,
		).toBe(
			maxHp +
				3,
		);
		expect(
			state.pendingLevelUps,
		).toBe(
			1,
		);
		expect(
			state.nextLevelUpLevel,
		).toBe(
			2,
		);
		expect(
			state.statSources.find(
				(
					s,
				) =>
					s.id ===
					levelUpgradeStatSourceId(
						1,
					),
			),
		).toEqual(
			{
				id: levelUpgradeStatSourceId(
					1,
				),
				kind: "upgrade",
				bonuses:
					{
						maxHp: 3,
					},
			},
		);

		state =
			selectUpgrade(
				state,
				2,
				"triceps",
				2,
			);
		expect(
			state
				.stats
				.damage,
		).toBe(
			8,
		);
		expect(
			state.pendingLevelUps,
		).toBe(
			0,
		);
	});

	it("ignores upgrades for another level or player, or without a level-up", () => {
		const leveled =
			spawn().gainMaterials(
				getTotalExperienceForLevel(
					1,
				),
			);
		expect(
			selectUpgrade(
				leveled,
				2,
			),
		).toBe(
			leveled,
		);
		expect(
			selectUpgrade(
				spawn(),
				1,
			)
				.statSources,
		).toEqual(
			spawn()
				.statSources,
		);
		expect(
			leveled.applyEvent(
				withEventMeta(
					{
						type: "upgradeSelected",
						playerId:
							"other",
						level: 1,
						upgradeId:
							"heart",
						tier: 1,
					},
					deltaTime(
						0,
					),
					nowTime(
						0,
					),
				),
			),
		).toBe(
			leveled,
		);
		expect(
			selectUpgrade(
				leveled,
				1,
				"unknown",
			),
		).toBe(
			leveled,
		);
	});

	it("keeps upgrades through JSON for network sync", () => {
		const state =
			selectUpgrade(
				spawn().gainMaterials(
					getTotalExperienceForLevel(
						1,
					),
				),
				1,
				"legs",
				4,
			);
		const json =
			JSON.parse(
				JSON.stringify(
					state.toJSON(),
				),
			);
		expect(
			json.statSources,
		).toEqual(
			state.statSources,
		);
		expect(
			json
				.stats
				.speed,
		).toBe(
			state
				.stats
				.speed,
		);
	});
});

describe("upgrade re-rolls", () => {
	function reroll(
		state: BulbroState,
		level: number,
		cost: number,
		rerollCount = state.upgradeRerollCount +
			1,
	) {
		return state.applyEvent(
			withEventMeta(
				{
					type: "upgradesRerolled",
					playerId:
						state.id,
					level,
					cost,
					rerollCount,
				},
				deltaTime(
					0,
				),
				nowTime(
					0,
				),
			),
		);
	}

	it("offers new choices after a re-roll", () => {
		const options =
			{
				playerId:
					"p1",
				level: 3,
				luck: 0,
			};
		const ids =
			(
				rerollCount: number,
			) =>
				generateUpgradeChoices(
					{
						...options,
						rerollCount,
					},
				)
					.map(
						(
							c,
						) =>
							c
								.upgrade
								.id,
					)
					.join();
		expect(
			ids(
				0,
			),
		).toBe(
			generateUpgradeChoices(
				options,
			)
				.map(
					(
						c,
					) =>
						c
							.upgrade
							.id,
				)
				.join(),
		);
		expect(
			new Set(
				[
					0,
					1,
					2,
					3,
				].map(
					ids,
				),
			)
				.size,
		).toBeGreaterThan(
			1,
		);
	});

	it("spends materials and counts re-rolls for the level", () => {
		const leveled =
			spawn().gainMaterials(
				getTotalExperienceForLevel(
					2,
				),
			);
		const rerolled =
			reroll(
				reroll(
					leveled,
					1,
					2,
				),
				1,
				3,
			);
		expect(
			rerolled.materialsAvailable,
		).toBe(
			leveled.materialsAvailable -
				5,
		);
		expect(
			rerolled.upgradeRerollCount,
		).toBe(
			2,
		);
	});

	it("resets the re-roll count once the upgrade is picked", () => {
		const leveled =
			spawn().gainMaterials(
				getTotalExperienceForLevel(
					2,
				),
			);
		const picked =
			selectUpgrade(
				reroll(
					leveled,
					1,
					1,
				),
				1,
			);
		expect(
			picked.upgradeRerollCount,
		).toBe(
			0,
		);
		expect(
			picked.nextLevelUpLevel,
		).toBe(
			2,
		);
	});

	it("ignores re-rolls without enough materials, for another level or without a level-up", () => {
		const leveled =
			spawn().gainMaterials(
				getTotalExperienceForLevel(
					1,
				),
			);
		expect(
			reroll(
				leveled,
				1,
				leveled.materialsAvailable +
					1,
			),
		).toBe(
			leveled,
		);
		expect(
			reroll(
				leveled,
				2,
				1,
			),
		).toBe(
			leveled,
		);
		const upgraded =
			selectUpgrade(
				leveled,
				1,
			);
		expect(
			reroll(
				upgraded,
				2,
				1,
			),
		).toBe(
			upgraded,
		);
	});
});
