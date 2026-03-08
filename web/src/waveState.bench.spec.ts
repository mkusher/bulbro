import {
	describe,
	expect,
	it,
} from "bun:test";
import { BulbroState } from "./bulbro/BulbroState";
import { baseStats } from "./characters-definitions/base";
import { EnemyState } from "./enemy/EnemyState";
import type { GameEvent } from "./game-events/GameEvents";
import { withEventMeta } from "./game-events/GameEvents";
import type { Material } from "./object/MaterialState";
import {
	deltaTime as dt,
	nowTime,
} from "./time";
import {
	generateMaterialMovementEvents,
	type WaveState,
} from "./waveState";

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

function createMaterial(
	id: string,
	x: number,
	y: number,
): Material {
	return {
		type: "material",
		id,
		materialType:
			"experience",
		position:
			{
				x,
				y,
			},
		value: 1,
	} as Material;
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
					3000,
					2250,
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
		return `${(val * 1_000_000).toFixed(0)}ns`;
	if (
		val <
		1
	)
		return `${(val * 1000).toFixed(2)}µs`;
	return `${val.toFixed(3)}ms`;
}

// ---------------------------------------------------------------------------
// Batched state updates
// ---------------------------------------------------------------------------

describe("waveState: batched state updates", () => {
	it("measures batched event application", () => {
		const enemyCount = 30;
		const enemies =
			Array.from(
				{
					length:
						enemyCount,
				},
				(
					_,
					i,
				) =>
					createEnemy(
						`enemy-${i}`,
						Math.random() *
							6000,
						Math.random() *
							4500,
					),
			);
		const state =
			makeState(
				{
					enemies,
				},
			);

		const events: GameEvent[] =
			enemies.map(
				(
					e,
				) =>
					withEventMeta(
						{
							type: "enemyMoved" as const,
							enemyId:
								e.id,
							from: e.position,
							to: {
								x:
									e
										.position
										.x +
									1,
								y:
									e
										.position
										.y +
									1,
							},
							direction:
								{
									x: 1,
									y: 0,
								},
						},
						dt(
							16,
						),
						nowTime(
							Date.now(),
						),
					),
			);

		const avg =
			benchmark(
				() => {
					const updates =
						new Map<
							string,
							GameEvent
						>();
					for (const event of events) {
						if (
							event.type ===
							"enemyMoved"
						)
							updates.set(
								event.enemyId,
								event,
							);
					}

					const newEnemies =
						state.enemies.map(
							(
								enemy,
							) => {
								const event =
									updates.get(
										enemy.id,
									);
								if (
									!event
								)
									return enemy;
								return enemy.applyEvent(
									event,
								);
							},
						);

					const _newState =
						{
							...state,
							enemies:
								newEnemies,
						};
				},
				1000,
			);

		console.log(
			`  Batched ${enemyCount} enemyMoved events: ${ms(avg)}`,
		);
		expect(
			avg,
		).toBeDefined();
	});
});

// ---------------------------------------------------------------------------
// Material movement hot path
// ---------------------------------------------------------------------------

describe("waveState: material movement", () => {
	it("measures generateMaterialMovementEvents with materials in range", () => {
		const player =
			createBulbro(
				"p1",
				3000,
				2250,
			);
		const materialCount = 20;
		const materials =
			Array.from(
				{
					length:
						materialCount,
				},
				(
					_,
					i,
				) =>
					createMaterial(
						`mat-${i}`,
						player
							.position
							.x +
							50 +
							i *
								5,
						player
							.position
							.y +
							50 +
							i *
								5,
					),
			);

		const state =
			makeState(
				{
					players:
						[
							player,
						],
					objects:
						materials,
				},
			);

		const frameDt =
			dt(
				16,
			);

		const avg =
			benchmark(
				() => {
					generateMaterialMovementEvents(
						state,
						frameDt,
					);
				},
				1000,
			);

		console.log(
			`  generateMaterialMovementEvents (${materialCount} materials): ${ms(avg)}`,
		);
		expect(
			avg,
		).toBeDefined();
	});

	it("measures players.filter(isAlive) hoisted", () => {
		const playerCount = 4;
		const materialCount = 20;
		const players =
			Array.from(
				{
					length:
						playerCount,
				},
				(
					_,
					i,
				) =>
					createBulbro(
						`p${i}`,
						3000 +
							i *
								100,
						2250,
					),
			);

		const avg =
			benchmark(
				() => {
					const alive =
						players.filter(
							(
								p,
							) =>
								p.isAlive(),
						);
					for (
						let i = 0;
						i <
						materialCount;
						i++
					) {
						const _ref =
							alive;
					}
				},
				5000,
			);

		console.log(
			`  players.filter hoisted (${materialCount} materials): ${ms(avg)}`,
		);
		expect(
			avg,
		).toBeDefined();
	});
});
