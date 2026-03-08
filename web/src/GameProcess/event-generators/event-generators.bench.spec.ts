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

/** Run a function many times and return average ms per iteration. */
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
	const elapsed =
		performance.now() -
		start;
	return (
		elapsed /
		iterations
	);
}

function fmtMs(
	val: number,
): string {
	if (
		val <
		0.001
	)
		return `${(val * 1_000_000).toFixed(0)}ns`;
	if (
		val <
		1
	)
		return `${(val * 1000).toFixed(2)}µs`;
	return `${val.toFixed(3)}ms`;
}

// ---------------------------------------------------------------------------
// PlayerHealEventGenerator
// ---------------------------------------------------------------------------

describe("PlayerHealEventGenerator", () => {
	const generator =
		new PlayerHealEventGenerator();

	it("benchmark: 4 players needing heals", () => {
		const players =
			Array.from(
				{
					length: 4,
				},
				(
					_,
					i,
				) =>
					createTestPlayer(
						`p${i}`,
						100 +
							i *
								100,
						100,
						[],
						50,
					),
			);
		const state =
			makeState(
				{
					players,
				},
			);

		const ms =
			benchmark(
				() =>
					generator.generate(
						state,
						dt,
						now,
					),
				5000,
			);
		console.log(
			`  PlayerHealEventGenerator (4 players): ${fmtMs(ms)}`,
		);
		expect(
			ms,
		).toBeDefined();
	});
});

// ---------------------------------------------------------------------------
// PlayerMovementEventGenerator
// ---------------------------------------------------------------------------

describe("PlayerMovementEventGenerator", () => {
	it("benchmark: 4 players moving", () => {
		const mockControls =
			Array.from(
				{
					length: 4,
				},
				() => ({
					start:
						async () => {},
					stop: async () => {},
					direction:
						{
							x: 1,
							y: 0,
						} as const,
					signal:
						{
							value:
								{
									x: 1,
									y: 0,
								},
						} as any,
				}),
			);
		const generator =
			new PlayerMovementEventGenerator(
				mockControls,
			);
		const players =
			Array.from(
				{
					length: 4,
				},
				(
					_,
					i,
				) =>
					createTestPlayer(
						`p${i}`,
						100 +
							i *
								100,
						100,
					),
			);
		const state =
			makeState(
				{
					players,
				},
			);

		const ms =
			benchmark(
				() =>
					generator.generate(
						state,
						dt,
						now,
					),
				5000,
			);
		console.log(
			`  PlayerMovementEventGenerator (4 players): ${fmtMs(ms)}`,
		);
		expect(
			ms,
		).toBeDefined();
	});
});

// ---------------------------------------------------------------------------
// EnemyBehaviorEventGenerator
// ---------------------------------------------------------------------------

describe("EnemyBehaviorEventGenerator", () => {
	const generator =
		new EnemyBehaviorEventGenerator();

	it("benchmark: 50 living enemies", () => {
		const enemies =
			Array.from(
				{
					length: 50,
				},
				(
					_,
					i,
				) =>
					createTestEnemy(
						`e${i}`,
						200 +
							(i %
								20) *
								30,
						200 +
							Math.floor(
								i /
									20,
							) *
								30,
					),
			);
		const state =
			makeState(
				{
					enemies,
				},
			);

		const ms =
			benchmark(
				() =>
					generator.generate(
						state,
						dt,
						now,
					),
				500,
			);
		console.log(
			`  EnemyBehaviorEventGenerator (50 enemies): ${fmtMs(ms)}`,
		);
		expect(
			ms,
		).toBeDefined();
	});

	it("benchmark: 50 enemies, 50% dead", () => {
		const enemies =
			Array.from(
				{
					length: 50,
				},
				(
					_,
					i,
				) =>
					createTestEnemy(
						`e${i}`,
						200 +
							(i %
								20) *
								30,
						200 +
							Math.floor(
								i /
									20,
							) *
								30,
						i <
							25
							? Date.now() -
									500
							: undefined,
					),
			);
		const state =
			makeState(
				{
					enemies,
				},
			);

		const ms =
			benchmark(
				() =>
					generator.generate(
						state,
						dt,
						now,
					),
				500,
			);
		console.log(
			`  EnemyBehaviorEventGenerator (50 enemies, 50% dead): ${fmtMs(ms)}`,
		);
		expect(
			ms,
		).toBeDefined();
	});
});

// ---------------------------------------------------------------------------
// PlayerWeaponEventGenerator
// ---------------------------------------------------------------------------

describe("PlayerWeaponEventGenerator", () => {
	const generator =
		new PlayerWeaponEventGenerator();

	it("benchmark: 4 players with weapons, 20 enemies", () => {
		const players =
			Array.from(
				{
					length: 4,
				},
				(
					_,
					i,
				) =>
					createTestPlayer(
						`p${i}`,
						100 +
							i *
								50,
						100,
						[
							createTestWeapon(
								`w${i}`,
							),
						],
					),
			);
		const enemies =
			Array.from(
				{
					length: 20,
				},
				(
					_,
					i,
				) =>
					createTestEnemy(
						`e${i}`,
						150 +
							(i %
								10) *
								20,
						80 +
							Math.floor(
								i /
									10,
							) *
								40,
					),
			);
		const state =
			makeState(
				{
					players,
					enemies,
				},
			);

		const ms =
			benchmark(
				() =>
					generator.generate(
						state,
						dt,
						now,
					),
				1000,
			);
		console.log(
			`  PlayerWeaponEventGenerator (4 players, 20 enemies): ${fmtMs(ms)}`,
		);
		expect(
			ms,
		).toBeDefined();
	});
});

// ---------------------------------------------------------------------------
// ShotMovementEventGenerator
// ---------------------------------------------------------------------------

describe("ShotMovementEventGenerator", () => {
	const generator =
		new ShotMovementEventGenerator();

	it("benchmark: 50 shots × 50 enemies (spatial grid)", () => {
		const shots =
			Array.from(
				{
					length: 50,
				},
				(
					_,
					i,
				) =>
					createTestShot(
						`s${i}`,
						"player",
						Math.random() *
							700 +
							50,
						Math.random() *
							500 +
							50,
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
					createTestEnemy(
						`e${i}`,
						Math.random() *
							700 +
							50,
						Math.random() *
							500 +
							50,
					),
			);
		const state =
			makeState(
				{
					shots,
					enemies,
				},
			);

		const ms =
			benchmark(
				() =>
					generator.generate(
						state,
						dt,
						now,
					),
				1000,
			);
		console.log(
			`  ShotMovementEventGenerator (50 shots, 50 enemies): ${fmtMs(ms)}`,
		);
		expect(
			ms,
		).toBeDefined();
	});

	it("benchmark: 50 shots × 50 enemies with 50% dead", () => {
		const shots =
			Array.from(
				{
					length: 50,
				},
				(
					_,
					i,
				) =>
					createTestShot(
						`s${i}`,
						"player",
						Math.random() *
							700 +
							50,
						Math.random() *
							500 +
							50,
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
					createTestEnemy(
						`e${i}`,
						Math.random() *
							700 +
							50,
						Math.random() *
							500 +
							50,
						i <
							25
							? Date.now() -
									500
							: undefined,
					),
			);
		const state =
			makeState(
				{
					shots,
					enemies,
				},
			);

		const ms =
			benchmark(
				() =>
					generator.generate(
						state,
						dt,
						now,
					),
				1000,
			);
		console.log(
			`  ShotMovementEventGenerator (50 shots, 50 enemies, 50% dead): ${fmtMs(ms)}`,
		);
		expect(
			ms,
		).toBeDefined();
	});

	it("benchmark: 10 enemy shots × 4 players", () => {
		const shots =
			Array.from(
				{
					length: 10,
				},
				(
					_,
					i,
				) =>
					createTestShot(
						`s${i}`,
						"enemy",
						200 +
							i *
								50,
						100,
						{
							x:
								-1,
							y: 0,
						},
					),
			);
		const players =
			Array.from(
				{
					length: 4,
				},
				(
					_,
					i,
				) =>
					createTestPlayer(
						`p${i}`,
						100,
						100 +
							i *
								50,
					),
			);
		const state =
			makeState(
				{
					shots,
					players,
				},
			);

		const ms =
			benchmark(
				() =>
					generator.generate(
						state,
						dt,
						now,
					),
				5000,
			);
		console.log(
			`  ShotMovementEventGenerator (10 enemy shots, 4 players): ${fmtMs(ms)}`,
		);
		expect(
			ms,
		).toBeDefined();
	});
});
