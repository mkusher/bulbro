import { describe, it, expect } from "bun:test";
import { RageRunningBehaviors } from "./RageRunningBehaviors";
import {
	EnemyState,
	spawnEnemy,
	RAGE_STARTING_DURATION,
	RAGE_TOTAL_DURATION,
} from "./EnemyState";
import { beetleWarrior } from "../enemies-definitions/beetle-warrior";
import { zeroPoint } from "@/geometry";
import type { WaveState } from "@/waveState";
import { BulbroState, spawnBulbro } from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions";
import { nowTime, deltaTime } from "@/time";

describe("RageRunningBehaviors", () => {
	const createTestEnemy = (position = zeroPoint()): EnemyState => {
		return spawnEnemy("enemy-1", position, beetleWarrior);
	};

	const createTestBulbro = (position = zeroPoint()): BulbroState => {
		return spawnBulbro("player-1", "normal", position, 0, 0, wellRoundedBulbro);
	};

	const createWaveState = (players: BulbroState[]): WaveState => {
		return {
			players,
			enemies: [],
			shots: [],
			objects: [],
			mapSize: { width: 5000, height: 5000 },
			round: {
				isRunning: true,
				duration: 60000,
				wave: 1,
				difficulty: 1,
				startedAt: Date.now(),
			},
		};
	};

	describe("move", () => {
		it("should not move during starting raging phase", () => {
			const behavior = new RageRunningBehaviors();
			const now = nowTime(Date.now());
			const enemy = new EnemyState({
				...createTestEnemy({ x: 100, y: 100 }).toJSON(),
				ragingStartedAt: (now - 100) as number,
				ragingDirection: { x: 1, y: 0 },
			});
			const player = createTestBulbro({ x: 200, y: 200 });
			const waveState = createWaveState([player]);

			const events = behavior.move(enemy, waveState, now, deltaTime(16));

			expect(events).toEqual([]);
		});

		it("should run at 2x speed in remembered direction during second raging phase", () => {
			const behavior = new RageRunningBehaviors();
			const now = nowTime(Date.now());
			const ragingStartTime = now - RAGE_STARTING_DURATION - 100;
			const initialSpeed = beetleWarrior.stats.speed;
			const enemy = new EnemyState({
				...createTestEnemy({ x: 100, y: 100 }).toJSON(),
				ragingStartedAt: ragingStartTime,
				ragingDirection: { x: 1, y: 0 },
			});
			const player = createTestBulbro({ x: 100, y: 200 });
			const waveState = createWaveState([player]);

			const events = behavior.move(enemy, waveState, now, deltaTime(16));

			expect(events.length).toBeGreaterThan(0);
			const moveEvent = events.find((e) => e.type === "enemyMoved");
			expect(moveEvent).toBeDefined();
			if (moveEvent && moveEvent.type === "enemyMoved") {
				const moveDistance = Math.sqrt(
					Math.pow(moveEvent.to.x - moveEvent.from.x, 2) +
						Math.pow(moveEvent.to.y - moveEvent.from.y, 2),
				);
				const expectedDistance = (initialSpeed * 2 * 16) / 1000;
				expect(Math.abs(moveDistance - expectedDistance)).toBeLessThan(0.1);

				expect(moveEvent.direction.x).toBeGreaterThan(0);
				expect(Math.abs(moveEvent.direction.y)).toBeLessThan(0.1);
			}
		});

		it("should move normally when not raging", () => {
			const behavior = new RageRunningBehaviors();
			const now = nowTime(Date.now());
			const enemy = createTestEnemy({ x: 100, y: 100 });
			const player = createTestBulbro({ x: 500, y: 100 });
			const waveState = createWaveState([player]);

			const events = behavior.move(enemy, waveState, now, deltaTime(16));

			expect(events.length).toBeGreaterThan(0);
			const moveEvent = events.find((e) => e.type === "enemyMoved");
			expect(moveEvent).toBeDefined();
		});

		it("should move normally after raging period ends", () => {
			const behavior = new RageRunningBehaviors();
			const now = nowTime(Date.now());
			const ragingStartTime = now - RAGE_TOTAL_DURATION - 100;
			const enemy = new EnemyState({
				...createTestEnemy({ x: 100, y: 100 }).toJSON(),
				ragingStartedAt: ragingStartTime,
				ragingDirection: { x: 1, y: 0 },
			});
			const player = createTestBulbro({ x: 500, y: 100 });
			const waveState = createWaveState([player]);

			const events = behavior.move(enemy, waveState, now, deltaTime(16));

			expect(events.length).toBeGreaterThan(0);
			const moveEvent = events.find((e) => e.type === "enemyMoved");
			expect(moveEvent).toBeDefined();
		});
	});

	describe("attack", () => {
		it("should start raging when player is in range", () => {
			const behavior = new RageRunningBehaviors();
			const now = nowTime(Date.now());
			const actualRange = beetleWarrior.stats.range * 4;
			const enemy = createTestEnemy({ x: 100, y: 100 });
			const player = createTestBulbro({ x: 100 + actualRange * 0.5, y: 100 });
			const waveState = createWaveState([player]);

			const events = behavior.attack(enemy, waveState, now, deltaTime(16));

			expect(events.length).toBe(1);
			const ragingEvent = events[0];
			expect(ragingEvent?.type).toBe("enemyRagingStarted");
			if (ragingEvent && ragingEvent.type === "enemyRagingStarted") {
				expect(ragingEvent.enemyId).toBe("enemy-1");
				expect(ragingEvent.direction).toBeDefined();
				expect(ragingEvent.direction.x).toBeGreaterThan(0);
			}
		});

		it("should continue normal attacks during and after raging", () => {
			const behavior = new RageRunningBehaviors();
			const now = nowTime(Date.now());
			const ragingStartTime = now - RAGE_STARTING_DURATION - 100;
			const enemy = new EnemyState({
				...createTestEnemy({ x: 100, y: 100 }).toJSON(),
				ragingStartedAt: ragingStartTime,
				ragingDirection: { x: 1, y: 0 },
			});
			const player = createTestBulbro({ x: 120, y: 100 });
			const waveState = createWaveState([player]);

			const events = behavior.attack(enemy, waveState, now, deltaTime(16));

			const attackEvent = events.find((e) => e.type === "enemyAttacked");
			expect(attackEvent).toBeDefined();
		});

		it("should not start raging when player is out of range", () => {
			const behavior = new RageRunningBehaviors();
			const now = nowTime(Date.now());
			const actualRange = beetleWarrior.stats.range * 4;
			const enemy = createTestEnemy({ x: 100, y: 100 });
			const player = createTestBulbro({ x: 100 + actualRange * 2, y: 100 });
			const waveState = createWaveState([player]);

			const events = behavior.attack(enemy, waveState, now, deltaTime(16));

			const ragingEvent = events.find((e) => e.type === "enemyRagingStarted");
			expect(ragingEvent).toBeUndefined();
		});

		it("should remember direction when starting to rage", () => {
			const behavior = new RageRunningBehaviors();
			const now = nowTime(Date.now());
			const actualRange = beetleWarrior.stats.range * 4;
			const enemy = createTestEnemy({ x: 100, y: 100 });
			const player = createTestBulbro({ x: 100 + actualRange * 0.5, y: 200 });
			const waveState = createWaveState([player]);

			const events = behavior.attack(enemy, waveState, now, deltaTime(16));

			expect(events.length).toBe(1);
			const ragingEvent = events[0];
			if (ragingEvent && ragingEvent.type === "enemyRagingStarted") {
				expect(ragingEvent.direction.y).toBeGreaterThan(0);
			}
		});
	});
});
