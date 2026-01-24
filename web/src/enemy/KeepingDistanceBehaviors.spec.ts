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
import { zeroPoint } from "@/geometry";
import {
	deltaTime,
	nowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { aphidEnemy } from "../enemies-definitions/aphid";
import {
	EnemyState,
	RAGE_STARTING_DURATION,
	RAGE_TOTAL_DURATION,
	spawnEnemy,
} from "./EnemyState";
import { KeepkingDistanceBehaviors } from "./KeepingDistanceBehaviors";

describe("KeepingDistanceBehaviors", () => {
	const createTestEnemy =
		(
			position = zeroPoint(),
		): EnemyState => {
			return spawnEnemy(
				"enemy-1",
				position,
				aphidEnemy,
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
	const actualRange =
		aphidEnemy
			.stats
			.range /
		2;

	describe("move", () => {
		it("should not move during starting raging phase", () => {
			const behavior =
				new KeepkingDistanceBehaviors();
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
						ragingStartedAt:
							(now -
								100) as number,
					},
				);
			const player =
				createTestBulbro(
					{
						x: 200,
						y: 200,
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

		it("should move away when player is too close (inside 0.75 range)", () => {
			const behavior =
				new KeepkingDistanceBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const tooCloseDistance =
				actualRange *
				0.5;
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
						x:
							100 +
							tooCloseDistance,
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
				const moveDirection =
					{
						x:
							moveEvent
								.to
								.x -
							moveEvent
								.from
								.x,
						y:
							moveEvent
								.to
								.y -
							moveEvent
								.from
								.y,
					};
				const toPlayerDirection =
					{
						x:
							player
								.position
								.x -
							enemy
								.position
								.x,
						y:
							player
								.position
								.y -
							enemy
								.position
								.y,
					};
				const dotProduct =
					moveDirection.x *
						toPlayerDirection.x +
					moveDirection.y *
						toPlayerDirection.y;
				expect(
					dotProduct,
				).toBeLessThan(
					0,
				);
			}
		});

		it("should not move when player is in optimal range (0.75-1.0 range)", () => {
			const behavior =
				new KeepkingDistanceBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const optimalDistance =
				actualRange *
				0.85;
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
						x:
							100 +
							optimalDistance,
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

		it("should move toward player when too far (beyond 1.0 range)", () => {
			const behavior =
				new KeepkingDistanceBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const farDistance =
				actualRange *
				1.5;
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
						x:
							100 +
							farDistance,
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
		});
	});

	describe("attack", () => {
		it("should start raging when player is in range", () => {
			const behavior =
				new KeepkingDistanceBehaviors();
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
						x:
							100 +
							actualRange *
								0.5,
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
			).toBe(
				1,
			);
			const ragingEvent =
				events[0];
			expect(
				ragingEvent?.type,
			).toBe(
				"enemyRagingStarted",
			);
			if (
				ragingEvent &&
				ragingEvent.type ===
					"enemyRagingStarted"
			) {
				expect(
					ragingEvent.enemyId,
				).toBe(
					"enemy-1",
				);
				expect(
					ragingEvent.direction,
				).toBeDefined();
			}
		});

		it("should not attack during starting raging phase", () => {
			const behavior =
				new KeepkingDistanceBehaviors();
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
						ragingStartedAt:
							(now -
								100) as number,
						ragingDirection:
							{
								x: 1,
								y: 0,
							},
					},
				);
			const player =
				createTestBulbro(
					{
						x: 200,
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

		it("should shoot in remembered direction during second raging phase", () => {
			const behavior =
				new KeepkingDistanceBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const ragingStartTime =
				now -
				RAGE_STARTING_DURATION -
				100;
			const enemy =
				new EnemyState(
					{
						...createTestEnemy(
							{
								x: 100,
								y: 100,
							},
						).toJSON(),
						ragingStartedAt:
							ragingStartTime,
						ragingDirection:
							{
								x: 1,
								y: 0,
							},
					},
				);
			const player =
				createTestBulbro(
					{
						x: 100,
						y: 200,
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
			if (
				shotEvent &&
				shotEvent.type ===
					"shot"
			) {
				const shotDirection =
					{
						x: shotEvent
							.shot
							.direction
							.x,
						y: shotEvent
							.shot
							.direction
							.y,
					};
				expect(
					Math.abs(
						shotDirection.x,
					),
				).toBeGreaterThan(
					Math.abs(
						shotDirection.y,
					),
				);
			}
		});

		it("should not attack after raging period is over", () => {
			const behavior =
				new KeepkingDistanceBehaviors();
			const now =
				nowTime(
					Date.now(),
				);
			const ragingStartTime =
				now -
				RAGE_TOTAL_DURATION -
				100;
			const enemy =
				new EnemyState(
					{
						...createTestEnemy(
							{
								x: 100,
								y: 100,
							},
						).toJSON(),
						ragingStartedAt:
							ragingStartTime,
						ragingDirection:
							{
								x: 1,
								y: 0,
							},
					},
				);
			const player =
				createTestBulbro(
					{
						x: 200,
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

		it("should not start raging when player is out of range", () => {
			const behavior =
				new KeepkingDistanceBehaviors();
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
						x:
							100 +
							actualRange *
								2,
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
	});
});
