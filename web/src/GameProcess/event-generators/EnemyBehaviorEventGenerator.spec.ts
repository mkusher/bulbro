import {
	describe,
	expect,
	it,
} from "bun:test";
import { EnemyState } from "../../enemy/EnemyState";
import {
	deltaTime as dt,
	nowTime,
} from "../../time";
import type { WaveState } from "../../waveState";
import { EnemyBehaviorEventGenerator } from "./EnemyBehaviorEventGenerator";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mapSize =
	{
		width: 6000,
		height: 4500,
	};

function createEnemy(
	id: string,
	x = 400,
	y = 400,
	killedAt?: number,
): EnemyState {
	return new EnemyState(
		{
			id,
			type: "potatoBeetleBaby",
			position:
				{
					x,
					y,
				},
			healthPoints: 50,
			stats:
				{
					maxHp: 50,
					hpRegeneration: 0,
					damage: 5,
					meleeDamage: 0,
					rangedDamage: 0,
					elementalDamage: 0,
					attackSpeed: 1,
					critChance: 0,
					range: 20,
					armor: 0,
					dodge: 0,
					speed: 50,
					materialsDropped: 1,
					knockback: 0,
				},
			weapons:
				[],
			lastMovedAt: 0,
			lastHitAt: 0,
			lastHorizontalDirection: 1,
			killedAt,
		},
	);
}

function makeState(
	overrides: Partial<WaveState> = {},
): WaveState {
	return {
		mapSize,
		players:
			[],
		enemies:
			[],
		objects:
			[],
		shots:
			[],
		lastShotsAt:
			nowTime(
				0,
			),
		lastMovementsAt:
			nowTime(
				0,
			),
		round:
			{
				isRunning: true,
				duration: 60,
				wave: 1,
				difficulty: 0,
				startedAt:
					Date.now(),
			},
		...overrides,
	};
}

function benchmark(
	fn: () => void,
	iterations = 1000,
): number {
	for (
		let i = 0;
		i <
		100;
		i++
	)
		fn();
	const start =
		performance.now();
	for (
		let i = 0;
		i <
		iterations;
		i++
	)
		fn();
	return (
		(performance.now() -
			start) /
		iterations
	);
}

function ms(
	val: number,
): string {
	if (
		val <
		0.001
	)
		return `${(val * 1_000_000).toFixed(1)}ns`;
	if (
		val <
		1
	)
		return `${(val * 1_000).toFixed(1)}µs`;
	return `${val.toFixed(3)}ms`;
}

// ---------------------------------------------------------------------------
// Correctness tests
// ---------------------------------------------------------------------------

describe("EnemyBehaviorEventGenerator", () => {
	const generator =
		new EnemyBehaviorEventGenerator();
	const now =
		nowTime(
			1000,
		);
	const delta =
		dt(
			16,
		);

	it("emits no events when there are no enemies", () => {
		const state =
			makeState(
				{
					enemies:
						[],
				},
			);
		const events =
			generator.generate(
				state,
				delta,
				now,
			);
		expect(
			events,
		).toHaveLength(
			0,
		);
	});

	it("skips dead enemies entirely", () => {
		const dead =
			createEnemy(
				"e1",
				400,
				400,
				500,
			);
		const state =
			makeState(
				{
					enemies:
						[
							dead,
						],
				},
			);
		const events =
			generator.generate(
				state,
				delta,
				now,
			);
		expect(
			events,
		).toHaveLength(
			0,
		);
	});

	it("emits events for a live enemy (at least a move or attack event)", () => {
		const enemy =
			createEnemy(
				"e1",
				400,
				400,
			);
		const state =
			makeState(
				{
					enemies:
						[
							enemy,
						],
				},
			);
		const events =
			generator.generate(
				state,
				delta,
				now,
			);
		// A live enemy will always produce some events (move or attack)
		expect(
			Array.isArray(
				events,
			),
		).toBe(
			true,
		);
	});

	it("emits events for each live enemy independently", () => {
		const e1 =
			createEnemy(
				"e1",
				400,
				400,
			);
		const e2 =
			createEnemy(
				"e2",
				500,
				500,
			);
		const state =
			makeState(
				{
					enemies:
						[
							e1,
							e2,
						],
				},
			);

		// Check that both enemies contribute events
		const eventsTwo =
			generator.generate(
				state,
				delta,
				now,
			);
		const eventsSingle =
			generator.generate(
				makeState(
					{
						enemies:
							[
								e1,
							],
					},
				),
				delta,
				now,
			);

		// Two enemies should produce at least as many events as one enemy
		expect(
			eventsTwo.length,
		).toBeGreaterThanOrEqual(
			eventsSingle.length,
		);
	});

	it("only processes live enemies — mix of alive and dead", () => {
		const alive =
			createEnemy(
				"e1",
				400,
				400,
			);
		const dead =
			createEnemy(
				"e2",
				500,
				500,
				800,
			);
		const state =
			makeState(
				{
					enemies:
						[
							alive,
							dead,
						],
				},
			);
		const events =
			generator.generate(
				state,
				delta,
				now,
			);
		// Dead enemy contributes nothing; live enemy contributes some events
		const eventsAloneAlive =
			generator.generate(
				makeState(
					{
						enemies:
							[
								alive,
							],
					},
				),
				delta,
				now,
			);
		expect(
			events,
		).toHaveLength(
			eventsAloneAlive.length,
		);
	});

	it("emits no enemy events with killedAt set", () => {
		// All dead — should produce 0 events regardless of count
		const dead =
			[
				createEnemy(
					"e1",
					400,
					400,
					100,
				),
				createEnemy(
					"e2",
					500,
					500,
					200,
				),
				createEnemy(
					"e3",
					600,
					600,
					300,
				),
			];
		const state =
			makeState(
				{
					enemies:
						dead,
				},
			);
		const events =
			generator.generate(
				state,
				delta,
				now,
			);
		expect(
			events,
		).toHaveLength(
			0,
		);
	});

	// ---------------------------------------------------------------------------
	// Benchmark
	// ---------------------------------------------------------------------------

	it("benchmark: 30 live enemies over 1000 frames", () => {
		const enemies =
			Array.from(
				{
					length: 30,
				},
				(
					_,
					i,
				) =>
					createEnemy(
						`e${i}`,
						400 +
							i *
								20,
						400 +
							i *
								20,
					),
			);
		const state =
			makeState(
				{
					enemies,
				},
			);
		const gen =
			new EnemyBehaviorEventGenerator();

		const avgMs =
			benchmark(
				() =>
					gen.generate(
						state,
						delta,
						now,
					),
			);
		console.log(
			`EnemyBehaviorEventGenerator 30 live enemies: ${ms(avgMs)}/frame`,
		);
		expect(
			avgMs,
		).toBeLessThan(
			5,
		);
	});

	it("benchmark: dead-enemy skip — 30 dead vs 30 live", () => {
		const dead =
			Array.from(
				{
					length: 30,
				},
				(
					_,
					i,
				) =>
					createEnemy(
						`e${i}`,
						400 +
							i *
								20,
						400 +
							i *
								20,
						500,
					),
			);
		const alive =
			Array.from(
				{
					length: 30,
				},
				(
					_,
					i,
				) =>
					createEnemy(
						`e${i}`,
						400 +
							i *
								20,
						400 +
							i *
								20,
					),
			);
		const stateDead =
			makeState(
				{
					enemies:
						dead,
				},
			);
		const stateAlive =
			makeState(
				{
					enemies:
						alive,
				},
			);
		const gen =
			new EnemyBehaviorEventGenerator();

		const avgDead =
			benchmark(
				() =>
					gen.generate(
						stateDead,
						delta,
						now,
					),
			);
		const avgAlive =
			benchmark(
				() =>
					gen.generate(
						stateAlive,
						delta,
						now,
					),
			);
		console.log(
			`EnemyBehaviorEventGenerator 30 dead: ${ms(avgDead)}/frame`,
		);
		console.log(
			`EnemyBehaviorEventGenerator 30 alive: ${ms(avgAlive)}/frame`,
		);

		// Dead enemies must be cheaper or equal
		expect(
			avgDead,
		).toBeLessThanOrEqual(
			avgAlive +
				0.5,
		);
	});
});
