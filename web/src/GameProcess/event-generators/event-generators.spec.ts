import {
	describe,
	expect,
	it,
} from "bun:test";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { BulbroState } from "../../bulbro";
import { EnemyState } from "../../enemy";
import { ShotState } from "../../shot/ShotState";
import type {
	WaveState,
	WeaponState,
} from "../../waveState";
import { EnemyBehaviorEventGenerator } from "./EnemyBehaviorEventGenerator";
import { PlayerHealEventGenerator } from "./PlayerHealEventGenerator";
import { PlayerMovementEventGenerator } from "./PlayerMovementEventGenerator";
import { PlayerWeaponEventGenerator } from "./PlayerWeaponEventGenerator";
import { ShotMovementEventGenerator } from "./ShotMovementEventGenerator";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTestPlayer(
	id: string,
	x = 100,
	y = 100,
	weapons: WeaponState[] = [],
	healthPoints = 80,
): BulbroState {
	return new BulbroState(
		{
			id,
			type: "normal",
			level: 1,
			totalExperience: 0,
			position:
				{
					x,
					y,
				},
			speed: 200,
			healthPoints,
			weapons,
			stats:
				{
					maxHp: 80,
					hpRegeneration: 0,
					damage: 5,
					meleeDamage: 0,
					rangedDamage: 0,
					elementalDamage: 0,
					attackSpeed: 1,
					critChance: 0,
					range: 100,
					armor: 0,
					dodge: 0,
					speed: 200,
					engineering: 0,
					luck: 0,
					knockback: 0,
					lifeSteal: 0,
					harvesting: 0,
					pickupRange: 0,
				},
			materialsAvailable: 0,
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

function createTestEnemy(
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

function createTestShot(
	id: string,
	shooterType:
		| "player"
		| "enemy",
	x = 0,
	y = 0,
	direction = {
		x: 1,
		y: 0,
	},
): ShotState {
	return new ShotState(
		{
			id,
			shooterId:
				"shooter-1",
			shooterType,
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
			direction,
			speed: 200,
			damage: 10,
			range: 300,
			knockback: 0,
			weaponType:
				"pistol",
		},
	);
}

function createTestWeapon(
	id = "weapon1",
): WeaponState {
	return {
		id,
		type: "pistol" as const,
		lastStrikedAt: 0,
		statsBonus:
			{
				damage: 5,
				attackSpeed: 1,
			},
		shotSpeed: 200,
		aimingDirection:
			{
				x: 1,
				y: 0,
			},
	};
}

function makeState(
	overrides: Partial<WaveState> = {},
): WaveState {
	return {
		mapSize:
			{
				width: 800,
				height: 600,
			},
		players:
			[
				createTestPlayer(
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
				difficulty: 1,
				startedAt:
					Date.now(),
			},
		...overrides,
		lastShotsAt:
			nowTime(
				0,
			),
		lastMovementsAt:
			nowTime(
				0,
			),
	};
}

const dt =
	deltaTime(
		16,
	);
const now =
	nowTime(
		Date.now(),
	);

// ---------------------------------------------------------------------------
// PlayerHealEventGenerator
// ---------------------------------------------------------------------------

describe("PlayerHealEventGenerator", () => {
	const generator =
		new PlayerHealEventGenerator();

	it("returns no events for full-health players", () => {
		const state =
			makeState();
		const events =
			generator.generate(
				state,
				dt,
				now,
			);
		expect(
			events,
		).toEqual(
			[],
		);
	});

	it("returns no events for dead players", () => {
		const state =
			makeState(
				{
					players:
						[
							createTestPlayer(
								"p1",
								100,
								100,
								[],
								0,
							),
						],
				},
			);
		const events =
			generator.generate(
				state,
				dt,
				now,
			);
		expect(
			events,
		).toEqual(
			[],
		);
	});
});

// ---------------------------------------------------------------------------
// PlayerMovementEventGenerator
// ---------------------------------------------------------------------------

describe("PlayerMovementEventGenerator", () => {
	it("returns no events with empty controls", () => {
		const generator =
			new PlayerMovementEventGenerator(
				[],
			);
		const state =
			makeState();
		const events =
			generator.generate(
				state,
				dt,
				now,
			);
		// With no controls, direction defaults to zero → no movement → no event
		expect(
			events,
		).toEqual(
			[],
		);
	});
});

// ---------------------------------------------------------------------------
// EnemyBehaviorEventGenerator
// ---------------------------------------------------------------------------

describe("EnemyBehaviorEventGenerator", () => {
	const generator =
		new EnemyBehaviorEventGenerator();

	it("skips dead enemies", () => {
		const state =
			makeState(
				{
					enemies:
						[
							createTestEnemy(
								"e1",
								400,
								400,
								Date.now(),
							),
						],
				},
			);
		const events =
			generator.generate(
				state,
				dt,
				now,
			);
		// Dead enemy should produce no events
		expect(
			events,
		).toEqual(
			[],
		);
	});

	it("generates events for living enemies", () => {
		const state =
			makeState(
				{
					enemies:
						[
							createTestEnemy(
								"e1",
								150,
								100,
							),
						],
				},
			);
		const events =
			generator.generate(
				state,
				dt,
				now,
			);
		// Should at least generate movement events
		expect(
			events.length,
		).toBeGreaterThan(
			0,
		);
	});
});

// ---------------------------------------------------------------------------
// PlayerWeaponEventGenerator
// ---------------------------------------------------------------------------

describe("PlayerWeaponEventGenerator", () => {
	const generator =
		new PlayerWeaponEventGenerator();

	it("generates no attack events when no enemies in range", () => {
		const player =
			createTestPlayer(
				"p1",
				100,
				100,
				[
					createTestWeapon(),
				],
			);
		const enemy =
			createTestEnemy(
				"e1",
				500,
				500,
			); // far away
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
				dt,
				now,
			);
		const attacks =
			events.filter(
				(
					e,
				) =>
					e.type ===
					"bulbroAttacked",
			);
		expect(
			attacks,
		).toHaveLength(
			0,
		);
	});

	it("generates attack events when enemy in range", () => {
		const player =
			createTestPlayer(
				"p1",
				100,
				100,
				[
					createTestWeapon(),
				],
			);
		const enemy =
			createTestEnemy(
				"e1",
				150,
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
				dt,
				now,
			);
		const attacks =
			events.filter(
				(
					e,
				) =>
					e.type ===
					"bulbroAttacked",
			);
		expect(
			attacks.length,
		).toBeGreaterThan(
			0,
		);
	});
});

// ---------------------------------------------------------------------------
// ShotMovementEventGenerator
// ---------------------------------------------------------------------------

describe("ShotMovementEventGenerator", () => {
	const generator =
		new ShotMovementEventGenerator();

	it("generates shotMoved when shot doesn't hit anything", () => {
		const shot =
			createTestShot(
				"s1",
				"player",
				100,
				100,
				{
					x: 0,
					y:
						-1,
				},
			);
		const state =
			makeState(
				{
					shots:
						[
							shot,
						],
				},
			);
		const events =
			generator.generate(
				state,
				dt,
				now,
			);
		const moved =
			events.filter(
				(
					e,
				) =>
					e.type ===
					"shotMoved",
			);
		expect(
			moved.length,
		).toBe(
			1,
		);
	});

	it("generates shotExpired when shot goes out of bounds", () => {
		const shot =
			createTestShot(
				"s1",
				"player",
				790,
				100,
				{
					x: 1,
					y: 0,
				},
			);
		const state =
			makeState(
				{
					shots:
						[
							shot,
						],
				},
			);
		const events =
			generator.generate(
				state,
				deltaTime(
					100,
				),
				now,
			);
		const expired =
			events.filter(
				(
					e,
				) =>
					e.type ===
					"shotExpired",
			);
		expect(
			expired.length,
		).toBe(
			1,
		);
	});

	it("generates hit event when player shot hits enemy", () => {
		const shot =
			createTestShot(
				"s1",
				"player",
				80,
				100,
				{
					x: 1,
					y: 0,
				},
			);
		const enemy =
			createTestEnemy(
				"e1",
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
						[
							enemy,
						],
				},
			);
		const events =
			generator.generate(
				state,
				deltaTime(
					100,
				),
				now,
			);
		const hits =
			events.filter(
				(
					e,
				) =>
					e.type ===
						"enemyReceivedHit" ||
					e.type ===
						"enemyDied",
			);
		expect(
			hits.length,
		).toBeGreaterThan(
			0,
		);
	});

	it("generates hit event when enemy shot hits player", () => {
		const shot =
			createTestShot(
				"s1",
				"enemy",
				120,
				100,
				{
					x:
						-1,
					y: 0,
				},
			);
		const state =
			makeState(
				{
					shots:
						[
							shot,
						],
				},
			);
		const events =
			generator.generate(
				state,
				deltaTime(
					100,
				),
				now,
			);
		const hits =
			events.filter(
				(
					e,
				) =>
					e.type ===
					"bulbroReceivedHit",
			);
		expect(
			hits.length,
		).toBeGreaterThan(
			0,
		);
	});

	it("skips dead enemies in collision detection", () => {
		const shot =
			createTestShot(
				"s1",
				"player",
				80,
				100,
				{
					x: 1,
					y: 0,
				},
			);
		const deadEnemy =
			createTestEnemy(
				"e1",
				100,
				100,
				Date.now() -
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
							deadEnemy,
						],
				},
			);
		const events =
			generator.generate(
				state,
				deltaTime(
					100,
				),
				now,
			);
		const hits =
			events.filter(
				(
					e,
				) =>
					e.type ===
						"enemyReceivedHit" ||
					e.type ===
						"enemyDied",
			);
		expect(
			hits,
		).toHaveLength(
			0,
		);
	});
});
