import {
	describe,
	expect,
	it,
} from "bun:test";
import { signal } from "@preact/signals";
import { BulbroState } from "../../bulbro/BulbroState";
import { baseStats } from "../../characters-definitions/base";
import type { PlayerControl } from "../../controls/PlayerControl";
import type { Direction } from "../../geometry";
import {
	deltaTime as dt,
	nowTime,
} from "../../time";
import type { WaveState } from "../../waveState";
import { PlayerMovementEventGenerator } from "./PlayerMovementEventGenerator";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mapSize =
	{
		width: 6000,
		height: 4500,
	};

function createBulbro(
	id: string,
	x = 100,
	y = 100,
	dead = false,
): BulbroState {
	return new BulbroState(
		{
			id,
			type: "normal",
			position:
				{
					x,
					y,
				},
			speed: 100,
			level: 1,
			totalExperience: 0,
			materialsAvailable: 0,
			healthPoints:
				dead
					? 0
					: 80,
			stats:
				{
					...baseStats,
					maxHp: 100,
					hpRegeneration: 0,
					damage: 10,
					range: 100,
					speed: 100,
					pickupRange: 200,
				},
			weapons:
				[],
			lastMovedAt: 0,
			lastHitAt: 0,
			healedByHpRegenerationAt: 0,
			rerollCount: 0,
			lastDirection:
				{
					x: 1,
					y: 0,
				},
			lastHorizontalDirection: 1,
			...(dead
				? {
						killedAt: 1000,
					}
				: {}),
		},
	);
}

function makeControl(
	dir: Direction,
): PlayerControl {
	return {
		direction:
			dir,
		signal:
			signal(
				dir,
			),
		start:
			async () => {},
		stop: async () => {},
	};
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

describe("PlayerMovementEventGenerator", () => {
	const now =
		nowTime(
			1000,
		);
	const delta =
		dt(
			16,
		);

	it("emits no events when there are no players", () => {
		const gen =
			new PlayerMovementEventGenerator(
				[],
			);
		const state =
			makeState(
				{
					players:
						[],
				},
			);
		const events =
			gen.generate(
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

	it("emits no events when direction is zero (player standing still)", () => {
		const player =
			createBulbro(
				"p1",
				3000,
				2250,
			);
		const control =
			makeControl(
				{
					x: 0,
					y: 0,
				},
			);
		const gen =
			new PlayerMovementEventGenerator(
				[
					control,
				],
			);
		const state =
			makeState(
				{
					players:
						[
							player,
						],
				},
			);
		const events =
			gen.generate(
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

	it("emits a bulbroMoved event when player moves in a direction", () => {
		const player =
			createBulbro(
				"p1",
				3000,
				2250,
			);
		const control =
			makeControl(
				{
					x: 1,
					y: 0,
				},
			);
		const gen =
			new PlayerMovementEventGenerator(
				[
					control,
				],
			);
		const state =
			makeState(
				{
					players:
						[
							player,
						],
				},
			);
		const events =
			gen.generate(
				state,
				delta,
				now,
			);
		expect(
			events,
		).toHaveLength(
			1,
		);
		expect(
			events[0]
				?.type,
		).toBe(
			"bulbroMoved",
		);
		expect(
			(
				events[0] as {
					bulbroId: string;
				}
			)
				.bulbroId,
		).toBe(
			"p1",
		);
	});

	it("emits events for all moving players independently", () => {
		const p1 =
			createBulbro(
				"p1",
				1000,
				1000,
			);
		const p2 =
			createBulbro(
				"p2",
				5000,
				3000,
			);
		const c1 =
			makeControl(
				{
					x: 1,
					y: 0,
				},
			);
		const c2 =
			makeControl(
				{
					x: 0,
					y: 1,
				},
			);
		const gen =
			new PlayerMovementEventGenerator(
				[
					c1,
					c2,
				],
			);
		const state =
			makeState(
				{
					players:
						[
							p1,
							p2,
						],
				},
			);
		const events =
			gen.generate(
				state,
				delta,
				now,
			);
		expect(
			events,
		).toHaveLength(
			2,
		);
		const ids =
			events.map(
				(
					e,
				) =>
					(
						e as {
							bulbroId: string;
						}
					)
						.bulbroId,
			);
		expect(
			ids,
		).toContain(
			"p1",
		);
		expect(
			ids,
		).toContain(
			"p2",
		);
	});

	it("skips dead players even if a control exists", () => {
		const dead =
			createBulbro(
				"p1",
				100,
				100,
				true,
			);
		const control =
			makeControl(
				{
					x: 1,
					y: 0,
				},
			);
		const gen =
			new PlayerMovementEventGenerator(
				[
					control,
				],
			);
		const state =
			makeState(
				{
					players:
						[
							dead,
						],
				},
			);
		const events =
			gen.generate(
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

	it("uses zero direction when fewer controls than players", () => {
		const p1 =
			createBulbro(
				"p1",
				1000,
				1000,
			);
		const p2 =
			createBulbro(
				"p2",
				5000,
				3000,
			);
		// Only one control for two players; p2 defaults to zero direction
		const c1 =
			makeControl(
				{
					x: 1,
					y: 0,
				},
			);
		const gen =
			new PlayerMovementEventGenerator(
				[
					c1,
				],
			);
		const state =
			makeState(
				{
					players:
						[
							p1,
							p2,
						],
				},
			);
		const events =
			gen.generate(
				state,
				delta,
				now,
			);
		// p1 moves, p2 stays still
		const movedIds =
			events.map(
				(
					e,
				) =>
					(
						e as {
							bulbroId: string;
						}
					)
						.bulbroId,
			);
		expect(
			movedIds,
		).toContain(
			"p1",
		);
		expect(
			movedIds,
		).not.toContain(
			"p2",
		);
	});

	it("clamps player position to map bounds", () => {
		// Player at the very right edge moving right — should not leave bounds
		const player =
			createBulbro(
				"p1",
				mapSize.width -
					1,
				100,
			);
		const control =
			makeControl(
				{
					x: 1,
					y: 0,
				},
			);
		const gen =
			new PlayerMovementEventGenerator(
				[
					control,
				],
			);
		const state =
			makeState(
				{
					players:
						[
							player,
						],
				},
			);
		const events =
			gen.generate(
				state,
				delta,
				now,
			);
		if (
			events.length >
			0
		) {
			const ev =
				events[0] as {
					to: {
						x: number;
						y: number;
					};
				};
			expect(
				ev
					.to
					.x,
			).toBeLessThanOrEqual(
				mapSize.width,
			);
		}
		// Pass as long as no exception thrown
		expect(
			Array.isArray(
				events,
			),
		).toBe(
			true,
		);
	});

	// ---------------------------------------------------------------------------
	// Benchmark
	// ---------------------------------------------------------------------------

	it("benchmark: 2 players moving each frame over 1000 frames", () => {
		const players =
			[
				createBulbro(
					"p1",
					3000,
					2250,
				),
				createBulbro(
					"p2",
					2000,
					1500,
				),
			];
		const controls =
			[
				makeControl(
					{
						x: 1,
						y: 0,
					},
				),
				makeControl(
					{
						x: 0,
						y: 1,
					},
				),
			];
		const gen =
			new PlayerMovementEventGenerator(
				controls,
			);
		const state =
			makeState(
				{
					players,
				},
			);

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
			`PlayerMovementEventGenerator 2 players: ${ms(avgMs)}/frame`,
		);
		expect(
			avgMs,
		).toBeLessThan(
			1,
		);
	});
});
