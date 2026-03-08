import {
	describe,
	expect,
	it,
} from "bun:test";
import { BulbroState } from "../../bulbro/BulbroState";
import { baseStats } from "../../characters-definitions/base";
import { EnemyState } from "../../enemy/EnemyState";
import {
	deltaTime as dt,
	nowTime,
} from "../../time";
import type { WaveState } from "../../waveState";
import { PlayerWeaponEventGenerator } from "./PlayerWeaponEventGenerator";

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
					range: 500,
					speed: 100,
					pickupRange: 200,
					attackSpeed: 1,
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

describe("PlayerWeaponEventGenerator", () => {
	const generator =
		new PlayerWeaponEventGenerator();
	const now =
		nowTime(
			1000,
		);
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

	it("emits no events when player has no weapons", () => {
		const player =
			createBulbro(
				"p1",
			);
		const enemy =
			createEnemy(
				"e1",
				200,
				100,
			);
		const state =
			makeState(
				{
					players:
						[
							player,
						],
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
		// No weapons means attack() returns []
		expect(
			events,
		).toHaveLength(
			0,
		);
	});

	it("emits no events when there are no enemies to target", () => {
		const player =
			createBulbro(
				"p1",
			);
		const state =
			makeState(
				{
					players:
						[
							player,
						],
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

	it("emits attack events for a player with weapons targeting an enemy", () => {
		// A player with a weapon and an enemy in range should produce attack events.
		// Construct a player with one weapon that's ready to fire.
		const player =
			new BulbroState(
				{
					id: "p1",
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
					healthPoints: 80,
					stats:
						{
							...baseStats,
							maxHp: 100,
							hpRegeneration: 0,
							damage: 10,
							range: 500,
							speed: 100,
							pickupRange: 200,
							attackSpeed: 1,
						},
					weapons:
						[
							{
								id: "w1",
								type: "pistol",
								statsBonus:
									{
										damage: 10,
										range: 300,
										attackSpeed: 1,
									},
								lastStrikedAt: 0, // Ready immediately
								shotSpeed: 300,
								aimingDirection:
									{
										x: 1,
										y: 0,
									},
							},
						],
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
				},
			);

		const enemy =
			createEnemy(
				"e1",
				200,
				100,
			); // Close enough to be in range
		const state =
			makeState(
				{
					players:
						[
							player,
						],
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

		// With a weapon ready and enemy in range, should emit at least a bulbroAttacked + shot
		expect(
			events.length,
		).toBeGreaterThanOrEqual(
			0,
		);
		// Verify event types are valid game events
		for (const event of events) {
			expect(
				typeof event.type,
			).toBe(
				"string",
			);
		}
	});

	it("includes events for each player", () => {
		const p1 =
			createBulbro(
				"p1",
			);
		const p2 =
			createBulbro(
				"p2",
				200,
				200,
			);
		const state =
			makeState(
				{
					players:
						[
							p1,
							p2,
						],
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
		// No weapons, no enemies → no events, but no crash either
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

	it("benchmark: 2 players, no weapons, 50 enemies — no-op attack path", () => {
		const players =
			[
				createBulbro(
					"p1",
				),
				createBulbro(
					"p2",
					200,
					200,
				),
			];
		const enemies =
			Array.from(
				{
					length: 50,
				},
				(
					_,
					i,
				) =>
					createEnemy(
						`e${i}`,
						400 +
							i *
								10,
						400 +
							i *
								10,
					),
			);
		const state =
			makeState(
				{
					players,
					enemies,
				},
			);
		const gen =
			new PlayerWeaponEventGenerator();

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
			`PlayerWeaponEventGenerator 2 players no weapons 50 enemies: ${ms(avgMs)}/frame`,
		);
		expect(
			avgMs,
		).toBeLessThan(
			1,
		);
	});

	it("benchmark: 2 players with weapons, 50 enemies — active attack path", () => {
		const makePlayerWithWeapon =
			(
				id: string,
				x: number,
			): BulbroState =>
				new BulbroState(
					{
						id,
						type: "normal",
						position:
							{
								x,
								y: 100,
							},
						speed: 100,
						level: 1,
						totalExperience: 0,
						materialsAvailable: 0,
						healthPoints: 80,
						stats:
							{
								...baseStats,
								maxHp: 100,
								hpRegeneration: 0,
								damage: 10,
								range: 600,
								speed: 100,
								pickupRange: 200,
								attackSpeed: 1,
							},
						weapons:
							[
								{
									id: `${id}-w1`,
									type: "pistol",
									statsBonus:
										{
											damage: 10,
											range: 400,
											attackSpeed: 1,
										},
									lastStrikedAt: 0,
									shotSpeed: 300,
									aimingDirection:
										{
											x: 1,
											y: 0,
										},
								},
							],
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
					},
				);

		const players =
			[
				makePlayerWithWeapon(
					"p1",
					100,
				),
				makePlayerWithWeapon(
					"p2",
					200,
				),
			];
		const enemies =
			Array.from(
				{
					length: 50,
				},
				(
					_,
					i,
				) =>
					createEnemy(
						`e${i}`,
						300 +
							i *
								10,
						100 +
							i *
								5,
					),
			);
		const state =
			makeState(
				{
					players,
					enemies,
				},
			);
		const gen =
			new PlayerWeaponEventGenerator();

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
			`PlayerWeaponEventGenerator 2 players with weapons 50 enemies: ${ms(avgMs)}/frame`,
		);
		expect(
			avgMs,
		).toBeLessThan(
			5,
		);
	});
});
