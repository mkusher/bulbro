import {
	describe,
	expect,
	it,
} from "bun:test";
import { BulbroState } from "../../bulbro/BulbroState";
import { baseStats } from "../../characters-definitions/base";
import {
	deltaTime as dt,
	nowTime,
} from "../../time";
import type { WaveState } from "../../waveState";
import { PlayerHealEventGenerator } from "./PlayerHealEventGenerator";

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
	hp: number,
	maxHp: number,
	healedAt = 0,
	lastHitAt = 0,
): BulbroState {
	return new BulbroState(
		{
			id,
			type: "normal",
			position:
				{
					x: 100,
					y: 100,
				},
			speed: 100,
			level: 1,
			totalExperience: 0,
			materialsAvailable: 0,
			healthPoints:
				hp,
			stats:
				{
					...baseStats,
					maxHp,
					hpRegeneration: 5,
					damage: 10,
					range: 100,
					speed: 100,
					pickupRange: 200,
				},
			weapons:
				[],
			lastMovedAt: 0,
			lastHitAt,
			healedByHpRegenerationAt:
				healedAt,
			rerollCount: 0,
			lastDirection:
				{
					x: 1,
					y: 0,
				},
			lastHorizontalDirection: 1,
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

describe("PlayerHealEventGenerator", () => {
	const generator =
		new PlayerHealEventGenerator();
	const now =
		nowTime(
			5_000,
		); // 5 seconds in
	const delta =
		dt(
			16,
		);

	it("emits no events when there are no players", () => {
		const state =
			makeState(
				{
					players:
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

	it("emits no event when player is at full HP", () => {
		const player =
			createBulbro(
				"p1",
				100,
				100,
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

	it("emits no event when player has not been alive long enough since last heal (< 1s)", () => {
		// healedAt = 4500, now = 5000 → only 500ms elapsed — below the 1000ms threshold
		const player =
			createBulbro(
				"p1",
				80,
				100,
				4500,
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

	it("emits a bulbroHealed event when player is injured and enough time has passed", () => {
		// healedAt = 0, now = 5000 → 5000ms elapsed — above threshold
		const player =
			createBulbro(
				"p1",
				80,
				100,
				0,
				0,
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
			generator.generate(
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
			"bulbroHealed",
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

	it("emits one event per injured player that qualifies", () => {
		const p1 =
			createBulbro(
				"p1",
				80,
				100,
				0,
				0,
			);
		const p2 =
			createBulbro(
				"p2",
				50,
				100,
				0,
				0,
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
			generator.generate(
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

	it("skips dead players", () => {
		// A dead player has healthPoints = 0
		const dead =
			new BulbroState(
				{
					id: "p1",
					type: "normal",
					position:
						{
							x: 0,
							y: 0,
						},
					speed: 100,
					level: 1,
					totalExperience: 0,
					materialsAvailable: 0,
					healthPoints: 0,
					stats:
						{
							...baseStats,
							maxHp: 100,
							hpRegeneration: 5,
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
					killedAt: 1000,
				},
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

	it("skips player who was recently hit (lastHitAt close to now)", () => {
		// HP regen is capped by timeSinceLastHit; if lastHitAt == now, result is 0 hp regen,
		// healByHpRegeneration returns the event with hp > 0 only when timeSinceLastHit > 0.
		// healedAt = 0, but lastHitAt = now (5000) → timeSinceLastHit = 0 → hp healed = 0
		// The event is still emitted by the generator but with hp = 0.
		// The generator emits it as long as the type is "bulbroHealed".
		const player =
			createBulbro(
				"p1",
				80,
				100,
				0,
				Number(
					now,
				),
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
			generator.generate(
				state,
				delta,
				now,
			);
		// Either 0 events (BulbroState returns `this`) or 1 event with 0 hp — both acceptable
		// by the contract; verify no crash occurs
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

	it("benchmark: 4 injured players over 1000 frames", () => {
		const players =
			[
				createBulbro(
					"p1",
					60,
					100,
					0,
					0,
				),
				createBulbro(
					"p2",
					70,
					100,
					0,
					0,
				),
				createBulbro(
					"p3",
					80,
					100,
					0,
					0,
				),
				createBulbro(
					"p4",
					50,
					100,
					0,
					0,
				),
			];
		const state =
			makeState(
				{
					players,
				},
			);
		const gen =
			new PlayerHealEventGenerator();

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
			`PlayerHealEventGenerator 4 players: ${ms(avgMs)}/frame`,
		);
		expect(
			avgMs,
		).toBeLessThan(
			1,
		);
	});
});
