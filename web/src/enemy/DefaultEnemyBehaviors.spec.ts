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
import { getAttackCooldown } from "@/game-formulas";
import { zeroPoint } from "@/geometry";
import {
	deltaTime,
	nowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { babyEnemy } from "../enemies-definitions/baby";
import { aphidEnemy } from "../enemies-definitions/aphid";
import { DefaultEnemyBehaviors } from "./DefaultEnemyBehaviors";
import {
	EnemyState,
	spawnEnemy,
} from "./EnemyState";

describe("DefaultEnemyBehaviors", () => {
	const createTestEnemy =
		(
			position = zeroPoint(),
			enemyDef = babyEnemy,
		): EnemyState => {
			return spawnEnemy(
				"enemy-1",
				position,
				enemyDef,
			);
		};

	const createTestBulbro =
		(
			position = zeroPoint(),
		): BulbroState => {
			return spawnBulbro(
				"player-1",
				"normal",
				position,
				0,
				0,
				wellRoundedBulbro,
			);
		};

	const createWaveState =
		(
			players: BulbroState[],
		): WaveState => {
			return {
				players,
				enemies:
					[],
				shots:
					[],
				objects:
					[],
				mapSize:
					{
						width: 5000,
						height: 5000,
					},
				round:
					{
						isRunning: true,
						duration: 60000,
						wave: 1,
						difficulty: 1,
						startedAt:
							Date.now(),
					},
			};
		};

	describe("getAttackCooldown", () => {
		it("should return weapon time in ms when entity attackSpeed is 0", () => {
			expect(
				getAttackCooldown(
					1,
					0,
				),
			).toBe(
				1000,
			);
			expect(
				getAttackCooldown(
					2,
					0,
				),
			).toBe(
				2000,
			);
		});

		it("should reduce cooldown by entity attackSpeed percentage", () => {
			expect(
				getAttackCooldown(
					1,
					50,
				),
			).toBe(
				500,
			);
		});

		it("should cap improvement at 90% to prevent instant attacks", () => {
			expect(
				getAttackCooldown(
					1,
					100,
				),
			).toBe(
				100,
			);
		});

		it("should clamp to minimum 100ms", () => {
			expect(
				getAttackCooldown(
					0.05,
					0,
				),
			).toBe(
				100,
			);
		});
	});

	describe("attack", () => {
		it("should attack when player is in range and weapon ready", () => {
			const behavior =
				new DefaultEnemyBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const enemy =
				createTestEnemy(
					{
						x: 100,
						y: 100,
					},
				);
			const player =
				createTestBulbro(
					{
						x: 150,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);

			const events =
				behavior.attack(
					enemy,
					waveState,
					now,
					deltaTime(
						16,
					),
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);
			const attackEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"enemyAttacked",
				);
			expect(
				attackEvent,
			).toBeDefined();
			const shotEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"shot",
				);
			expect(
				shotEvent,
			).toBeDefined();
		});

		it("should not attack when player is out of range", () => {
			const behavior =
				new DefaultEnemyBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const enemy =
				createTestEnemy(
					{
						x: 100,
						y: 100,
					},
				);
			const player =
				createTestBulbro(
					{
						x: 1000,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);

			const events =
				behavior.attack(
					enemy,
					waveState,
					now,
					deltaTime(
						16,
					),
				);

			expect(
				events,
			).toEqual(
				[],
			);
		});

		it("should not attack when weapon is on cooldown", () => {
			const behavior =
				new DefaultEnemyBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const enemy =
				new EnemyState(
					{
						...createTestEnemy(
							{
								x: 100,
								y: 100,
							},
						).toJSON(),
						weapons:
							[
								{
									...createTestEnemy()
										.weapons[0]!,
									lastStrikedAt:
										now -
										100,
								},
							],
					},
				);
			const player =
				createTestBulbro(
					{
						x: 150,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);

			const events =
				behavior.attack(
					enemy,
					waveState,
					now,
					deltaTime(
						16,
					),
				);

			expect(
				events,
			).toEqual(
				[],
			);
		});

		it("should attack after cooldown has elapsed", () => {
			const behavior =
				new DefaultEnemyBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const baseEnemy =
				createTestEnemy(
					{
						x: 100,
						y: 100,
					},
				);
			const weaponTime =
				baseEnemy
					.weapons[0]!
					.statsBonus
					?.attackSpeed ??
				1;
			const entityAttackSpeed =
				baseEnemy
					.stats
					.attackSpeed ??
				0;
			const cooldown =
				getAttackCooldown(
					weaponTime,
					entityAttackSpeed,
				);

			const enemy =
				new EnemyState(
					{
						...baseEnemy.toJSON(),
						weapons:
							[
								{
									...baseEnemy
										.weapons[0]!,
									lastStrikedAt:
										now -
										cooldown -
										10,
								},
							],
					},
				);
			const player =
				createTestBulbro(
					{
						x: 150,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);

			const events =
				behavior.attack(
					enemy,
					waveState,
					now,
					deltaTime(
						16,
					),
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);
		});

		it("baby enemy weapon time defines attack speed", () => {
			const enemy =
				createTestEnemy(
					{
						x: 100,
						y: 100,
					},
					babyEnemy,
				);

			const weaponTime =
				enemy
					.weapons[0]!
					.statsBonus
					?.attackSpeed ??
				1;
			const entityAttackSpeed =
				enemy
					.stats
					.attackSpeed ??
				0;
			const cooldown =
				getAttackCooldown(
					weaponTime,
					entityAttackSpeed,
				);

			expect(
				cooldown,
			).toBe(
				weaponTime *
					1000 *
					(1 -
						entityAttackSpeed /
							100),
			);
		});

		it("should target closest player in range", () => {
			const behavior =
				new DefaultEnemyBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const enemy =
				createTestEnemy(
					{
						x: 100,
						y: 100,
					},
				);
			const farPlayer =
				spawnBulbro(
					"player-far",
					"normal",
					{
						x: 200,
						y: 100,
					},
					0,
					0,
					wellRoundedBulbro,
				);
			const closePlayer =
				spawnBulbro(
					"player-close",
					"normal",
					{
						x: 120,
						y: 100,
					},
					0,
					0,
					wellRoundedBulbro,
				);
			const waveState =
				createWaveState(
					[
						farPlayer,
						closePlayer,
					],
				);

			const events =
				behavior.attack(
					enemy,
					waveState,
					now,
					deltaTime(
						16,
					),
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);
			const attackEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"enemyAttacked",
				);
			expect(
				attackEvent,
			).toBeDefined();
			if (
				attackEvent &&
				attackEvent.type ===
					"enemyAttacked"
			) {
				expect(
					attackEvent.targetId,
				).toBe(
					"player-close",
				);
			}
		});
	});

	describe("move", () => {
		it("should move toward closest player", () => {
			const behavior =
				new DefaultEnemyBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const enemy =
				createTestEnemy(
					{
						x: 100,
						y: 100,
					},
				);
			const player =
				createTestBulbro(
					{
						x: 500,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);

			const events =
				behavior.move(
					enemy,
					waveState,
					now,
					deltaTime(
						16,
					),
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);
			const moveEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"enemyMoved",
				);
			expect(
				moveEvent,
			).toBeDefined();
			if (
				moveEvent &&
				moveEvent.type ===
					"enemyMoved"
			) {
				expect(
					moveEvent
						.to
						.x,
				).toBeGreaterThan(
					moveEvent
						.from
						.x,
				);
			}
		});

		it("should not move when no players", () => {
			const behavior =
				new DefaultEnemyBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const enemy =
				createTestEnemy(
					{
						x: 100,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[],
				);

			const events =
				behavior.move(
					enemy,
					waveState,
					now,
					deltaTime(
						16,
					),
				);

			expect(
				events,
			).toEqual(
				[],
			);
		});

		it("should not move when killed", () => {
			const behavior =
				new DefaultEnemyBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const enemy =
				new EnemyState(
					{
						...createTestEnemy(
							{
								x: 100,
								y: 100,
							},
						).toJSON(),
						killedAt:
							now -
							1000,
					},
				);
			const player =
				createTestBulbro(
					{
						x: 500,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);

			const events =
				behavior.move(
					enemy,
					waveState,
					now,
					deltaTime(
						16,
					),
				);

			expect(
				events,
			).toEqual(
				[],
			);
		});
	});
});
