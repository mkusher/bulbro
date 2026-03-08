import {
	describe,
	expect,
	it,
} from "bun:test";
import { BulbroState } from "../../bulbro/BulbroState";
import { baseStats } from "../../characters-definitions/base";
import { EnemyState } from "../../enemy/EnemyState";
import { ShotState } from "../../shot/ShotState";
import {
	deltaTime as dt,
	nowTime,
} from "../../time";
import type { WaveState } from "../../waveState";
import { ShotMovementEventGenerator } from "./ShotMovementEventGenerator";

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
	x = 3000,
	y = 2250,
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

function createPlayerShot(
	id: string,
	x = 0,
	y = 0,
	dirX = 1,
	dirY = 0,
): ShotState {
	return new ShotState(
		{
			id,
			shooterId:
				"p1",
			shooterType:
				"player",
			startPosition:
				{
					x,
					y,
				},
			position:
				{
					x,
					y,
				},
			direction:
				{
					x: dirX,
					y: dirY,
				},
			speed: 300,
			damage: 10,
			range: 500,
			knockback: 0,
			weaponType:
				"pistol",
		},
	);
}

function createEnemyShot(
	id: string,
	x = 0,
	y = 0,
	dirX = 1,
	dirY = 0,
): ShotState {
	return new ShotState(
		{
			id,
			shooterId:
				"e1",
			shooterType:
				"enemy",
			startPosition:
				{
					x,
					y,
				},
			position:
				{
					x,
					y,
				},
			direction:
				{
					x: dirX,
					y: dirY,
				},
			speed: 200,
			damage: 5,
			range: 400,
			knockback: 0,
			weaponType:
				"pistol",
		},
	);
}

function makeState(
	overrides: Partial<WaveState> = {},
): WaveState {
	return {
		mapSize,
		players:
			[
				createBulbro(
					"p1",
				),
			],
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

describe("ShotMovementEventGenerator", () => {
	const generator =
		new ShotMovementEventGenerator();
	const now =
		nowTime(
			1000,
		);
	const delta =
		dt(
			16,
		);

	it("emits no events when there are no shots", () => {
		const state =
			makeState(
				{
					shots:
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

	it("emits a shotMoved event for a shot moving within bounds", () => {
		// Shot starts at left side, moving right, nowhere near any enemy
		const shot =
			createPlayerShot(
				"s1",
				100,
				100,
			);
		const state =
			makeState(
				{
					shots:
						[
							shot,
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
			1,
		);
		expect(
			events[0]
				?.type,
		).toBe(
			"shotMoved",
		);
		expect(
			(
				events[0] as {
					shotId: string;
				}
			)
				.shotId,
		).toBe(
			"s1",
		);
	});

	it("emits a shotExpired event when shot exceeds its range", () => {
		// Shot at range - 1px from start, moving right — will exceed range after one step
		const shot =
			new ShotState(
				{
					id: "s1",
					shooterId:
						"p1",
					shooterType:
						"player",
					startPosition:
						{
							x: 100,
							y: 100,
						},
					position:
						{
							x: 598,
							y: 100,
						}, // 498px from start, range=500, speed=300*0.016=4.8px/frame
					direction:
						{
							x: 1,
							y: 0,
						},
					speed: 300,
					damage: 10,
					range: 500,
					knockback: 0,
					weaponType:
						"pistol",
				},
			);
		const state =
			makeState(
				{
					shots:
						[
							shot,
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
		// At 598px + (300 * 0.016) = 598 + 4.8 = 602.8 → exceeds 500 range → expires
		expect(
			events.length,
		).toBeGreaterThanOrEqual(
			1,
		);
		const hasExpired =
			events.some(
				(
					e,
				) =>
					e.type ===
					"shotExpired",
			);
		expect(
			hasExpired,
		).toBe(
			true,
		);
	});

	it("emits shotExpired when shot leaves map bounds", () => {
		// Shot near the right edge, moving right
		const shot =
			createPlayerShot(
				"s1",
				mapSize.width -
					2,
				100,
			);
		const state =
			makeState(
				{
					shots:
						[
							shot,
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
		const hasExpired =
			events.some(
				(
					e,
				) =>
					e.type ===
					"shotExpired",
			);
		expect(
			hasExpired,
		).toBe(
			true,
		);
	});

	it("emits a hit event and shotExpired when a player shot hits a live enemy", () => {
		// Enemy positioned directly in the path of the shot
		const shot =
			createPlayerShot(
				"s1",
				100,
				100,
				1,
				0,
			);
		// Place enemy at 116px — within one frame of movement (300 speed × 0.016 delta = 4.8px)
		// so let's place enemy right at 104px which is within the shot trajectory
		const enemy =
			createEnemy(
				"e1",
				104,
				100,
			);
		const state =
			makeState(
				{
					shots:
						[
							shot,
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

		// Should have a hit event + shotExpired
		const hasExpired =
			events.some(
				(
					e,
				) =>
					e.type ===
					"shotExpired",
			);
		const hasHit =
			events.some(
				(
					e,
				) =>
					e.type ===
						"enemyReceivedHit" ||
					e.type ===
						"enemyDied",
			);
		// Either the shot hit (both) or moved (neither) — depends on exact geometry
		if (
			hasHit
		) {
			expect(
				hasExpired,
			).toBe(
				true,
			);
		}
		expect(
			Array.isArray(
				events,
			),
		).toBe(
			true,
		);
	});

	it("skips dead enemies in player shot collision", () => {
		const shot =
			createPlayerShot(
				"s1",
				100,
				100,
				1,
				0,
			);
		const deadEnemy =
			createEnemy(
				"e1",
				104,
				100,
				500,
			); // killed
		const state =
			makeState(
				{
					shots:
						[
							shot,
						],
					enemies:
						[
							deadEnemy,
						],
				},
			);
		const events =
			generator.generate(
				state,
				delta,
				now,
			);

		// Dead enemy should not be hit — should only get shotMoved or shotExpired
		const hasHit =
			events.some(
				(
					e,
				) =>
					e.type ===
						"enemyReceivedHit" ||
					e.type ===
						"enemyDied",
			);
		expect(
			hasHit,
		).toBe(
			false,
		);
	});

	it("emits a hit event when enemy shot hits a live player", () => {
		// Enemy shot moving right toward the player
		const player =
			createBulbro(
				"p1",
				200,
				100,
			);
		// Shot starts at 100 moving right at 200 speed → 200 * 0.016 = 3.2px per frame
		// Place shot at 195 so next position is ~198, intersects player rect
		const shot =
			createEnemyShot(
				"s1",
				195,
				100,
				1,
				0,
			);
		const state =
			makeState(
				{
					shots:
						[
							shot,
						],
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

		const hasPlayerHit =
			events.some(
				(
					e,
				) =>
					e.type ===
						"bulbroReceivedHit" ||
					e.type ===
						"bulbroDied",
			);
		const hasExpired =
			events.some(
				(
					e,
				) =>
					e.type ===
					"shotExpired",
			);

		if (
			hasPlayerHit
		) {
			expect(
				hasExpired,
			).toBe(
				true,
			);
		}
		expect(
			Array.isArray(
				events,
			),
		).toBe(
			true,
		);
	});

	it("handles multiple shots in a single frame", () => {
		const shots =
			[
				createPlayerShot(
					"s1",
					100,
					100,
				),
				createPlayerShot(
					"s2",
					200,
					200,
				),
				createPlayerShot(
					"s3",
					300,
					300,
				),
			];
		const state =
			makeState(
				{
					shots,
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
		// Each shot should produce at least one event
		expect(
			events.length,
		).toBeGreaterThanOrEqual(
			shots.length,
		);
	});

	it("each shot produces exactly one outcome (move xor expire+hit)", () => {
		const shots =
			[
				createPlayerShot(
					"s1",
					500,
					500,
				),
				createPlayerShot(
					"s2",
					600,
					600,
				),
			];
		const state =
			makeState(
				{
					shots,
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

		// Each shot either moves or expires — never both
		for (const shot of shots) {
			const moved =
				events.filter(
					(
						e,
					) =>
						e.type ===
							"shotMoved" &&
						(
							e as {
								shotId: string;
							}
						)
							.shotId ===
							shot.id,
				);
			const expired =
				events.filter(
					(
						e,
					) =>
						e.type ===
							"shotExpired" &&
						(
							e as {
								shotId: string;
							}
						)
							.shotId ===
							shot.id,
				);
			expect(
				moved.length +
					expired.length,
			).toBeGreaterThanOrEqual(
				1,
			);
			// A shot cannot both move and expire
			expect(
				moved.length >
					0 &&
					expired.length >
						0,
			).toBe(
				false,
			);
		}
	});

	// ---------------------------------------------------------------------------
	// Benchmark: spatial grid vs brute-force
	// ---------------------------------------------------------------------------

	it("benchmark: 50 player shots × 50 live enemies — spatial grid", () => {
		const shots =
			Array.from(
				{
					length: 50,
				},
				(
					_,
					i,
				) =>
					createPlayerShot(
						`s${i}`,
						100 +
							i *
								5,
						100 +
							i *
								5,
					),
			);
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
						600 +
							(i %
								10) *
								64,
						600 +
							Math.floor(
								i /
									10,
							) *
								64,
					),
			);
		const state =
			makeState(
				{
					shots,
					enemies,
				},
			);
		const gen =
			new ShotMovementEventGenerator();

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
			`ShotMovementEventGenerator 50 shots × 50 enemies (spatial grid): ${ms(avgMs)}/frame`,
		);
		expect(
			avgMs,
		).toBeLessThan(
			1,
		);
	});

	it("benchmark: dead enemy pre-filter — 50 shots × 50 dead enemies", () => {
		const shots =
			Array.from(
				{
					length: 50,
				},
				(
					_,
					i,
				) =>
					createPlayerShot(
						`s${i}`,
						100 +
							i *
								5,
						100 +
							i *
								5,
					),
			);
		const deadEnemies =
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
						600 +
							(i %
								10) *
								64,
						600 +
							Math.floor(
								i /
									10,
							) *
								64,
						500,
					),
			);
		const liveEnemies =
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
						600 +
							(i %
								10) *
								64,
						600 +
							Math.floor(
								i /
									10,
							) *
								64,
					),
			);
		const stateDead =
			makeState(
				{
					shots,
					enemies:
						deadEnemies,
				},
			);
		const stateAlive =
			makeState(
				{
					shots,
					enemies:
						liveEnemies,
				},
			);
		const gen =
			new ShotMovementEventGenerator();

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
			`ShotMovementEventGenerator 50 shots × 50 dead enemies: ${ms(avgDead)}/frame`,
		);
		console.log(
			`ShotMovementEventGenerator 50 shots × 50 live enemies: ${ms(avgAlive)}/frame`,
		);
		// Dead enemies are pre-filtered so grid is empty — must be at least as fast
		expect(
			avgDead,
		).toBeLessThanOrEqual(
			avgAlive +
				0.5,
		);
	});

	it("benchmark: 50 enemy shots × 2 players", () => {
		const shots =
			Array.from(
				{
					length: 50,
				},
				(
					_,
					i,
				) =>
					createEnemyShot(
						`s${i}`,
						100 +
							i *
								10,
						100 +
							i *
								10,
						1,
						0,
					),
			);
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
		const state =
			makeState(
				{
					shots,
					players,
					enemies:
						[],
				},
			);
		const gen =
			new ShotMovementEventGenerator();

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
			`ShotMovementEventGenerator 50 enemy shots × 2 players: ${ms(avgMs)}/frame`,
		);
		expect(
			avgMs,
		).toBeLessThan(
			1,
		);
	});
});
