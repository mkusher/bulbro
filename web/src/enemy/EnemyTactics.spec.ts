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
import type { Position } from "@/geometry";
import {
	deltaTime,
	nowTime,
} from "@/time";
import type { WaveState } from "@/waveState";
import {
	beetleWarrior,
	roach,
} from "../enemies-definitions";
import { ChasingBehavior } from "./ChasingBehavior";
import {
	type EnemyState,
	RAGE_COOLDOWN,
	RAGE_TOTAL_DURATION,
	spawnEnemy,
} from "./EnemyState";
import {
	LEAD_FACTOR,
	predictTargetPosition,
	withSeparation,
} from "./EnemyTactics";
import { RageRunningBehaviors } from "./RageRunningBehaviors";

const createBulbro =
	(
		position: Position,
	): BulbroState =>
		spawnBulbro(
			"player-1",
			"normal",
			position,
			0,
			0,
			wellRoundedBulbro,
		);

const moveBulbro =
	(
		bulbro: BulbroState,
		at: number,
	): BulbroState =>
		bulbro.applyEvent(
			{
				type: "bulbroMoved",
				bulbroId:
					bulbro.id,
				from: bulbro.position,
				to: bulbro.position,
				direction:
					{
						x: 1,
						y: 0,
					},
				occurredAt:
					nowTime(
						at,
					),
				deltaTime:
					deltaTime(
						16,
					),
			},
		);

const createWaveState =
	(
		players: BulbroState[],
		enemies: EnemyState[] = [],
	): WaveState => ({
		players,
		enemies,
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
				startedAt: 0,
			},
		lastShotsAt:
			nowTime(
				0,
			),
		lastMovementsAt:
			nowTime(
				0,
			),
	});

describe("predictTargetPosition", () => {
	it("aims directly at a standing target", () => {
		const bulbro =
			createBulbro(
				{
					x: 1000,
					y: 1000,
				},
			);

		expect(
			predictTargetPosition(
				bulbro,
				nowTime(
					5000,
				),
				500,
			),
		).toEqual(
			{
				x: 1000,
				y: 1000,
			},
		);
	});

	it("leads a moving target along its direction", () => {
		const bulbro =
			moveBulbro(
				createBulbro(
					{
						x: 1000,
						y: 1000,
					},
				),
				5000,
			);

		const predicted =
			predictTargetPosition(
				bulbro,
				nowTime(
					5016,
				),
				500,
			);

		expect(
			predicted.x,
		).toBeCloseTo(
			1000 +
				(bulbro.speed *
					500 *
					LEAD_FACTOR) /
					1000,
		);
		expect(
			predicted.y,
		).toBe(
			1000,
		);
	});
});

describe("withSeparation", () => {
	it("keeps the direction when no enemies are nearby", () => {
		const enemy =
			spawnEnemy(
				"enemy-1",
				{
					x: 100,
					y: 100,
				},
				roach,
			);

		expect(
			withSeparation(
				enemy,
				[
					enemy,
				],
				{
					x: 1,
					y: 0,
				},
			),
		).toEqual(
			{
				x: 1,
				y: 0,
			},
		);
	});

	it("steers away from a close neighbour", () => {
		const enemy =
			spawnEnemy(
				"enemy-1",
				{
					x: 100,
					y: 100,
				},
				roach,
			);
		const neighbour =
			spawnEnemy(
				"enemy-2",
				{
					x: 100,
					y: 130,
				},
				roach,
			);

		const steered =
			withSeparation(
				enemy,
				[
					enemy,
					neighbour,
				],
				{
					x: 1,
					y: 0,
				},
			);

		expect(
			steered.x,
		).toBeGreaterThan(
			0,
		);
		expect(
			steered.y,
		).toBeLessThan(
			0,
		);
	});

	it("makes chasers spread out instead of stacking", () => {
		const enemy =
			spawnEnemy(
				"enemy-1",
				{
					x: 100,
					y: 100,
				},
				roach,
			);
		const neighbour =
			spawnEnemy(
				"enemy-2",
				{
					x: 100,
					y: 130,
				},
				roach,
			);
		const waveState =
			createWaveState(
				[
					createBulbro(
						{
							x: 2000,
							y: 100,
						},
					),
				],
				[
					enemy,
					neighbour,
				],
			);

		const events =
			new ChasingBehavior().move(
				enemy,
				waveState,
				nowTime(
					5000,
				),
				deltaTime(
					16,
				),
			);

		const moved =
			events[0];
		expect(
			moved?.type,
		).toBe(
			"enemyMoved",
		);
		if (
			moved?.type ===
			"enemyMoved"
		) {
			expect(
				moved
					.to
					.y,
			).toBeLessThan(
				100,
			);
		}
	});
});

describe("rage cooldown", () => {
	const rage =
		(
			enemy: EnemyState,
			at: number,
		) =>
			enemy.applyEvent(
				{
					type: "enemyRagingStarted",
					enemyId:
						enemy.id,
					direction:
						{
							x: 1,
							y: 0,
						},
					occurredAt:
						nowTime(
							at,
						),
					deltaTime:
						deltaTime(
							16,
						),
				},
			);

	it("does not rage again right after a missed charge", () => {
		const enemy =
			rage(
				spawnEnemy(
					"enemy-1",
					{
						x: 100,
						y: 100,
					},
					beetleWarrior,
				),
				1000,
			);
		const waveState =
			createWaveState(
				[
					createBulbro(
						{
							x: 300,
							y: 100,
						},
					),
				],
			);

		const events =
			new RageRunningBehaviors().attack(
				enemy,
				waveState,
				nowTime(
					1000 +
						RAGE_TOTAL_DURATION,
				),
				deltaTime(
					16,
				),
			);

		expect(
			events.some(
				(
					e,
				) =>
					e.type ===
					"enemyRagingStarted",
			),
		).toBe(
			false,
		);
	});

	it("rages again after a missed charge cools down", () => {
		const enemy =
			rage(
				spawnEnemy(
					"enemy-1",
					{
						x: 100,
						y: 100,
					},
					beetleWarrior,
				),
				1000,
			);
		const waveState =
			createWaveState(
				[
					createBulbro(
						{
							x: 300,
							y: 100,
						},
					),
				],
			);

		const events =
			new RageRunningBehaviors().attack(
				enemy,
				waveState,
				nowTime(
					1000 +
						RAGE_TOTAL_DURATION +
						RAGE_COOLDOWN,
				),
				deltaTime(
					16,
				),
			);

		expect(
			events[0]
				?.type,
		).toBe(
			"enemyRagingStarted",
		);
	});
});
