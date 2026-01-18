import {
	beforeEach,
	describe,
	expect,
	it,
	mock,
} from "bun:test";
import type { Logger } from "pino";
import {
	type BulbroState,
	spawnBulbro,
} from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions";
import {
	deltaTime,
	nowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import { ENEMY_SIZE } from ".";
import { EnemySpawner } from "./EnemySpawner";

// Create a mock logger
const createMockLogger =
	(): Logger => {
		return {
			debug:
				() => {},
			info: () => {},
			warn: () => {},
			error:
				() => {},
			fatal:
				() => {},
			trace:
				() => {},
			child:
				() =>
					createMockLogger(),
		} as unknown as Logger;
	};

describe("EnemySpawner", () => {
	const createTestBulbro =
		(
			position = {
				x: 0,
				y: 0,
			},
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
			mapSize = {
				width: 1000,
				height: 1000,
			},
		): WaveState => {
			return {
				players,
				enemies:
					[],
				shots:
					[],
				objects:
					[],
				mapSize,
				round:
					{
						isRunning: true,
						duration: 60000,
						wave: 1,
						difficulty: 1,
						startedAt: 0,
					},
			};
		};

	describe("spawn position clamping", () => {
		it("should clamp spawn positions to map boundaries when player is at top-left corner", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			const mapSize =
				{
					width: 500,
					height: 500,
				};
			// Player at top-left corner - spawn could go negative
			const player =
				createTestBulbro(
					{
						x: 100,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
					mapSize,
				);

			// Trigger spawn at second 0
			const now =
				nowTime(
					0,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			// Should spawn some enemies
			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);

			// All spawn positions should be within map boundaries
			const halfW =
				ENEMY_SIZE.width /
				2;
			const halfH =
				ENEMY_SIZE.height /
				2;

			for (const event of events) {
				expect(
					event.type,
				).toBe(
					"spawnEnemy",
				);
				if (
					event.type ===
					"spawnEnemy"
				) {
					const pos =
						event
							.enemy
							.position;
					expect(
						pos.x,
					).toBeGreaterThanOrEqual(
						halfW,
					);
					expect(
						pos.x,
					).toBeLessThanOrEqual(
						mapSize.width -
							halfW,
					);
					expect(
						pos.y,
					).toBeGreaterThanOrEqual(
						halfH,
					);
					expect(
						pos.y,
					).toBeLessThanOrEqual(
						mapSize.height -
							halfH,
					);
				}
			}
		});

		it("should clamp spawn positions to map boundaries when player is at bottom-right corner", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			const mapSize =
				{
					width: 500,
					height: 500,
				};
			// Player at bottom-right corner - spawn could exceed map size
			const player =
				createTestBulbro(
					{
						x: 450,
						y: 450,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
					mapSize,
				);

			// Trigger spawn at second 0
			const now =
				nowTime(
					0,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			// Should spawn some enemies
			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);

			// All spawn positions should be within map boundaries
			const halfW =
				ENEMY_SIZE.width /
				2;
			const halfH =
				ENEMY_SIZE.height /
				2;

			for (const event of events) {
				expect(
					event.type,
				).toBe(
					"spawnEnemy",
				);
				if (
					event.type ===
					"spawnEnemy"
				) {
					const pos =
						event
							.enemy
							.position;
					expect(
						pos.x,
					).toBeGreaterThanOrEqual(
						halfW,
					);
					expect(
						pos.x,
					).toBeLessThanOrEqual(
						mapSize.width -
							halfW,
					);
					expect(
						pos.y,
					).toBeGreaterThanOrEqual(
						halfH,
					);
					expect(
						pos.y,
					).toBeLessThanOrEqual(
						mapSize.height -
							halfH,
					);
				}
			}
		});

		it("should clamp spawn positions on very small maps", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			// Very small map - smaller than spawn distance ranges
			const mapSize =
				{
					width: 200,
					height: 200,
				};
			const player =
				createTestBulbro(
					{
						x: 100,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
					mapSize,
				);

			const now =
				nowTime(
					0,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);

			const halfW =
				ENEMY_SIZE.width /
				2;
			const halfH =
				ENEMY_SIZE.height /
				2;

			for (const event of events) {
				if (
					event.type ===
					"spawnEnemy"
				) {
					const pos =
						event
							.enemy
							.position;
					expect(
						pos.x,
					).toBeGreaterThanOrEqual(
						halfW,
					);
					expect(
						pos.x,
					).toBeLessThanOrEqual(
						mapSize.width -
							halfW,
					);
					expect(
						pos.y,
					).toBeGreaterThanOrEqual(
						halfH,
					);
					expect(
						pos.y,
					).toBeLessThanOrEqual(
						mapSize.height -
							halfH,
					);
				}
			}
		});

		it("should spawn enemies within bounds on normal-sized maps", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			const mapSize =
				{
					width: 6000,
					height: 4500,
				};
			const player =
				createTestBulbro(
					{
						x: 3000,
						y: 2250,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
					mapSize,
				);

			const now =
				nowTime(
					0,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);

			const halfW =
				ENEMY_SIZE.width /
				2;
			const halfH =
				ENEMY_SIZE.height /
				2;

			for (const event of events) {
				if (
					event.type ===
					"spawnEnemy"
				) {
					const pos =
						event
							.enemy
							.position;
					expect(
						pos.x,
					).toBeGreaterThanOrEqual(
						halfW,
					);
					expect(
						pos.x,
					).toBeLessThanOrEqual(
						mapSize.width -
							halfW,
					);
					expect(
						pos.y,
					).toBeGreaterThanOrEqual(
						halfH,
					);
					expect(
						pos.y,
					).toBeLessThanOrEqual(
						mapSize.height -
							halfH,
					);
				}
			}
		});

		it("should clamp positions at second 15 spawn wave (medium range)", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			const mapSize =
				{
					width: 500,
					height: 500,
				};
			const player =
				createTestBulbro(
					{
						x: 100,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
					mapSize,
				);

			// Trigger spawn at second 15 (medium range spawn)
			const now =
				nowTime(
					15000,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);

			const halfW =
				ENEMY_SIZE.width /
				2;
			const halfH =
				ENEMY_SIZE.height /
				2;

			for (const event of events) {
				if (
					event.type ===
					"spawnEnemy"
				) {
					const pos =
						event
							.enemy
							.position;
					expect(
						pos.x,
					).toBeGreaterThanOrEqual(
						halfW,
					);
					expect(
						pos.x,
					).toBeLessThanOrEqual(
						mapSize.width -
							halfW,
					);
					expect(
						pos.y,
					).toBeGreaterThanOrEqual(
						halfH,
					);
					expect(
						pos.y,
					).toBeLessThanOrEqual(
						mapSize.height -
							halfH,
					);
				}
			}
		});

		it("should clamp positions at second 21 spawn wave (long range + short range)", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			const mapSize =
				{
					width: 500,
					height: 500,
				};
			const player =
				createTestBulbro(
					{
						x: 100,
						y: 100,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
					mapSize,
				);

			// Trigger spawn at second 21 (long range spawn)
			const now =
				nowTime(
					21000,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);

			const halfW =
				ENEMY_SIZE.width /
				2;
			const halfH =
				ENEMY_SIZE.height /
				2;

			for (const event of events) {
				if (
					event.type ===
					"spawnEnemy"
				) {
					const pos =
						event
							.enemy
							.position;
					expect(
						pos.x,
					).toBeGreaterThanOrEqual(
						halfW,
					);
					expect(
						pos.x,
					).toBeLessThanOrEqual(
						mapSize.width -
							halfW,
					);
					expect(
						pos.y,
					).toBeGreaterThanOrEqual(
						halfH,
					);
					expect(
						pos.y,
					).toBeLessThanOrEqual(
						mapSize.height -
							halfH,
					);
				}
			}
		});
	});

	describe("spawn timing", () => {
		it("should spawn enemies at second 0", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			const player =
				createTestBulbro(
					{
						x: 500,
						y: 500,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);

			const now =
				nowTime(
					0,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);
			expect(
				events[0]
					?.type,
			).toBe(
				"spawnEnemy",
			);
		});

		it("should not spawn enemies between spawn seconds", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			const player =
				createTestBulbro(
					{
						x: 500,
						y: 500,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);

			// At 1.5 seconds - no spawn should occur
			const now =
				nowTime(
					1500,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			expect(
				events.length,
			).toBe(
				0,
			);
		});

		it("should spawn enemies at second 3", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			const player =
				createTestBulbro(
					{
						x: 500,
						y: 500,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);

			const now =
				nowTime(
					3000,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);
		});
	});

	describe("spawn count", () => {
		it("should spawn 5 + difficulty enemies", () => {
			const spawner =
				new EnemySpawner(
					createMockLogger(),
				);
			const player =
				createTestBulbro(
					{
						x: 500,
						y: 500,
					},
				);
			const waveState =
				createWaveState(
					[
						player,
					],
				);
			waveState.round.difficulty = 3;

			const now =
				nowTime(
					0,
				);
			const dt =
				deltaTime(
					16,
				);

			const events =
				spawner.tick(
					waveState,
					dt,
					now,
				);

			// Should spawn 5 + 3 = 8 enemies
			expect(
				events.length,
			).toBe(
				8,
			);
		});
	});
});
