import {
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import { BulbroState } from "./bulbro/BulbroState";
import { baseStats } from "./characters-definitions/base";
import { DefaultEnemyBehaviors } from "./enemy/DefaultEnemyBehaviors";
import type { EnemyCharacter } from "./enemy/EnemyCharacter";
import {
	EnemyState,
	spawnEnemy,
} from "./enemy/EnemyState";
import type {
	BulbroAttackedEvent,
	BulbroHealedEvent,
	BulbroMovedEvent,
	EnemyAttackedEvent,
	EnemyMovedEvent,
	GameEvent,
	MaterialMovedEvent,
	MoveShotEvent,
	ShotEvent,
	TickEvent,
} from "./game-events/GameEvents";
import { withEventMeta } from "./game-events/GameEvents";
import { zeroPoint } from "./geometry";
import type { Material } from "./object/MaterialState";
import type { Player } from "./player";
import { ShotState } from "./shot/ShotState";
import {
	deltaTime,
	nowTime,
} from "./time";
import { uuid } from "./uuid";
import {
	createInitialState,
	generateMaterialMovementEvents,
	handleBulbroAttacked,
	handleBulbroHealed,
	handleEnemyAttacked,
	movePlayer,
	updateState,
	type WaveState,
	type WeaponState,
} from "./waveState";
import type {
	Weapon,
	WeaponType,
} from "./weapon";

function createTestPlayer(
	id: string,
): Player {
	return {
		id,
		bulbro:
			{
				id,
				name: `bulbro-${id}`,
				statBonuses:
					{
						maxHp: 90, // +90 HP (base 10 + bonus = 100)
						hpRegeneration: 5, // +5% HP regen
						damage: 10, // +10% damage
						pickupRange:
							-80, // -80% pickup range (base 100 - 80% = 20)
					},
				weapons:
					[],
				style:
					{
						faceType:
							"normal",
						wearingItems:
							[],
					},
				defaultWeapons:
					[],
				availableWeapons:
					[],
			},
	};
}

function createTestBulbro(
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
					pickupRange: 20,
				},
			weapons:
				[],
			lastMovedAt: 0,
			lastHitAt: 0,
			healedByHpRegenerationAt: 0,
			lastDirection:
				{
					x: 1,
					y: 0,
				},
		},
	);
}

function createTestEnemy(
	id: string,
	x = 400,
	y = 400,
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
			killedAt:
				undefined,
		},
	);
}

function createTestShot(
	id: string,
	shooterId: string,
	shooterType:
		| "player"
		| "enemy",
	x = 0,
	y = 0,
): ShotState {
	return new ShotState(
		{
			id,
			shooterId,
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
			direction:
				{
					x: 1,
					y: 0,
				},
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
	type: WeaponType,
): WeaponState {
	return {
		id: uuid(),
		type,
		lastStrikedAt: 0,
		statsBonus:
			{
				damage: 5,
				attackSpeed: 1,
			},
		shotSpeed: 200,
		aimingDirection:
			zeroPoint(),
	};
}

function createTestEnemyCharacter(
	id: string,
	weapons: Weapon[] = [],
): EnemyCharacter {
	return {
		id,
		sprite:
			"potatoBeetleBaby",
		name: `enemy-${id}`,
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
		weapons,
	};
}

function createTestWeaponDefinition(
	id: WeaponType,
): Weapon {
	return {
		id,
		name: `test-weapon-${id}`,
		classes:
			[
				"gun",
			],
		statsBonus:
			{
				damage: 5,
				attackSpeed: 1,
			},
		shotSpeed: 200,
	};
}

describe("waveState", () => {
	let state: WaveState;
	let player1: BulbroState;
	let player2: BulbroState;
	let enemy1: EnemyState;

	beforeEach(
		() => {
			player1 =
				createTestBulbro(
					"player1",
					100,
					100,
				);
			player2 =
				createTestBulbro(
					"player2",
					200,
					200,
				);
			enemy1 =
				createTestEnemy(
					"enemy1",
					400,
					400,
				);

			state =
				{
					mapSize:
						{
							width: 800,
							height: 600,
						},
					players:
						[
							player1,
							player2,
						],
					enemies:
						[
							enemy1,
						],
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
				};
		},
	);

	describe("updateState", () => {
		it("should handle bulbroMoved events", () => {
			const moveEvent: GameEvent =
				{
					type: "bulbroMoved",
					bulbroId:
						"player1",
					from: {
						x: 100,
						y: 100,
					},
					to: {
						x: 120,
						y: 100,
					},
					direction:
						{
							x: 1,
							y: 0,
						},
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					moveEvent,
				);
			const movedPlayer =
				newState.players.find(
					(
						p,
					) =>
						p.id ===
						"player1",
				);
			expect(
				movedPlayer
					?.position
					.x,
			).toBeGreaterThan(
				100,
			);
		});

		it("should handle bulbroHealed events", () => {
			const healEvent: GameEvent =
				{
					type: "bulbroHealed",
					bulbroId:
						"player1",
					hp: 10,
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					healEvent,
				);
			const healedPlayer =
				newState.players.find(
					(
						p,
					) =>
						p.id ===
						"player1",
				);
			expect(
				healedPlayer?.healthPoints,
			).toBeGreaterThan(
				state
					.players[0]!
					.healthPoints,
			);
		});

		it("should handle bulbroAttacked events", () => {
			const weapon =
				createTestWeapon(
					"smg",
				);
			const playerWithWeapon =
				player1.useWeapons(
					[
						weapon,
					],
				);
			// Replace the entire players array instead of mutating
			state =
				{
					...state,
					players:
						[
							playerWithWeapon,
							player2,
						],
				};

			const attackEvent: GameEvent =
				{
					type: "bulbroAttacked",
					bulbroId:
						"player1",
					weaponId:
						weapon.id,
					targetId:
						"enemy1",
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					attackEvent,
				);
			const attackingPlayer =
				newState.players.find(
					(
						p,
					) =>
						p.id ===
						"player1",
				);
			expect(
				attackingPlayer,
			).toBeDefined();
			expect(
				attackingPlayer
					?.weapons
					.length,
			).toBeGreaterThan(
				0,
			);

			const attackedWeapon =
				attackingPlayer?.weapons.find(
					(
						w,
					) =>
						w.id ===
						weapon.id,
				);
			expect(
				attackedWeapon,
			).toBeDefined();
			expect(
				typeof attackedWeapon?.lastStrikedAt,
			).toBe(
				"number",
			);
			expect(
				attackedWeapon?.lastStrikedAt,
			).toBeGreaterThan(
				0,
			);
		});

		it("should handle enemyAttacked events", () => {
			const weapon =
				createTestWeaponDefinition(
					"orcGun",
				);
			const enemyCharacter =
				createTestEnemyCharacter(
					"enemy-char1",
					[
						weapon,
					],
				);
			const enemyWithWeapon =
				spawnEnemy(
					"enemy1",
					{
						x: 400,
						y: 400,
					},
					enemyCharacter,
				);
			state.enemies[0] =
				enemyWithWeapon;

			const weaponId =
				enemyWithWeapon
					.weapons[0]
					?.id;
			expect(
				weaponId,
			).toBeDefined();

			const attackEvent: GameEvent =
				{
					type: "enemyAttacked",
					enemyId:
						"enemy1",
					weaponId:
						weaponId!,
					targetId:
						"player1",
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					attackEvent,
				);
			const attackingEnemy =
				newState.enemies.find(
					(
						e,
					) =>
						e.id ===
						"enemy1",
				);
			const attackedWeapon =
				attackingEnemy?.weapons.find(
					(
						w,
					) =>
						w.id ===
						weaponId,
				);
			expect(
				attackedWeapon?.lastStrikedAt,
			).toBeGreaterThan(
				0,
			);
		});

		it("should handle enemyMoved events", () => {
			const moveEvent: GameEvent =
				{
					type: "enemyMoved",
					enemyId:
						"enemy1",
					from: {
						x: 400,
						y: 400,
					},
					to: {
						x: 390,
						y: 400,
					},
					direction:
						{
							x:
								-1,
							y: 0,
						},
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					moveEvent,
				);
			const movedEnemy =
				newState.enemies.find(
					(
						e,
					) =>
						e.id ===
						"enemy1",
				);
			expect(
				movedEnemy
					?.position
					.x,
			).toBe(
				390,
			);
			expect(
				movedEnemy
					?.position
					.y,
			).toBe(
				400,
			);
		});

		it("should handle materialMoved events", () => {
			// Add a material object to test
			state.objects =
				[
					{
						type: "material",
						id: "material1",
						position:
							{
								x: 110,
								y: 110,
							},
						value: 10,
					},
				];

			const moveEvent: GameEvent =
				{
					type: "materialMoved",
					materialId:
						"material1",
					from: {
						x: 110,
						y: 110,
					},
					to: {
						x: 105,
						y: 110,
					},
					direction:
						{
							x:
								-1,
							y: 0,
						},
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					moveEvent,
				);
			const movedMaterial =
				newState.objects.find(
					(
						obj,
					) =>
						obj.id ===
						"material1",
				);
			expect(
				movedMaterial
					?.position
					.x,
			).toBe(
				105,
			);
			expect(
				movedMaterial
					?.position
					.y,
			).toBe(
				110,
			);
		});

		it("should handle shot events", () => {
			const shot =
				createTestShot(
					"shot1",
					"player1",
					"player",
					100,
					100,
				);
			const shotEvent: GameEvent =
				{
					type: "shot",
					shot,
					weaponId:
						"weapon1",
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					shotEvent,
				);
			expect(
				newState.shots,
			).toHaveLength(
				1,
			);
			expect(
				newState
					.shots[0]
					?.id,
			).toBe(
				"shot1",
			);
		});

		it("should handle shotMoved events", () => {
			const shot =
				createTestShot(
					"shot1",
					"player1",
					"player",
					50,
					50,
				);
			state.shots =
				[
					shot,
				];

			const shotMovedEvent: GameEvent =
				{
					type: "shotMoved",
					shotId:
						"shot1",
					from: {
						x: 50,
						y: 50,
					},
					to: {
						x: 70,
						y: 50,
					},
					direction:
						{
							x: 1,
							y: 0,
						},
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					shotMovedEvent,
				);
			// Shot should be updated with new position
			const updatedShot =
				newState.shots.find(
					(
						s,
					) =>
						s.id ===
						"shot1",
				);
			expect(
				updatedShot?.position,
			).toEqual(
				{
					x: 70,
					y: 50,
				},
			);
		});

		it("should handle spawnEnemy events", () => {
			const newEnemy =
				createTestEnemy(
					"enemy2",
					300,
					300,
				);
			const spawnEvent =
				{
					type: "spawnEnemy" as const,
					enemy:
						newEnemy,
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					spawnEvent,
				);
			expect(
				newState.objects,
			).toHaveLength(
				1,
			); // Should add spawning object
			expect(
				newState
					.objects[0]
					?.type,
			).toBe(
				"spawning-enemy",
			);
		});

		it("should maintain consistent position through spawn lifecycle", () => {
			// This test verifies there's no disconnect between:
			// 1. The position in the spawnEnemy event
			// 2. The position stored in the spawning-enemy object
			// 3. The position of the enemy when it becomes active

			const spawnPosition =
				{
					x: 500,
					y: 600,
				};
			const newEnemy =
				createTestEnemy(
					"enemy-spawn-test",
					spawnPosition.x,
					spawnPosition.y,
				);

			// Step 1: Create spawn event
			const startTime = 1000;
			const spawnEvent =
				{
					type: "spawnEnemy" as const,
					enemy:
						newEnemy,
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							startTime,
						),
				};

			// Step 2: Process spawn event - should create spawning-enemy object
			const stateAfterSpawn =
				updateState(
					state,
					spawnEvent,
				);

			// Verify spawning-enemy object has correct position
			const spawningObject =
				stateAfterSpawn.objects.find(
					(
						o,
					) =>
						o.type ===
							"spawning-enemy" &&
						o.id ===
							"enemy-spawn-test",
				);
			expect(
				spawningObject,
			).toBeDefined();
			expect(
				spawningObject?.position,
			).toEqual(
				spawnPosition,
			);

			// Also verify the embedded enemy has the same position
			if (
				spawningObject?.type ===
				"spawning-enemy"
			) {
				expect(
					spawningObject
						.enemy
						.position,
				).toEqual(
					spawnPosition,
				);
			}

			// Step 3: Process another spawn event after duration expires (1 second)
			// The spawn duration is 1 second, so at startTime + 1000ms + 1ms, the enemy should spawn
			const afterDurationEvent =
				{
					type: "spawnEnemy" as const,
					enemy:
						createTestEnemy(
							"another-enemy",
							100,
							100,
						), // Different enemy to trigger processing
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							startTime +
								1001,
						), // Just after 1 second duration
				};

			const stateAfterDuration =
				updateState(
					stateAfterSpawn,
					afterDurationEvent,
				);

			// The original spawning-enemy should now be converted to an actual enemy
			const spawnedEnemy =
				stateAfterDuration.enemies.find(
					(
						e,
					) =>
						e.id ===
						"enemy-spawn-test",
				);
			expect(
				spawnedEnemy,
			).toBeDefined();

			// CRITICAL: The enemy position should match the original spawn position
			expect(
				spawnedEnemy?.position,
			).toEqual(
				spawnPosition,
			);
		});

		it("should handle tick events", () => {
			const tickEvent: GameEvent =
				{
					type: "tick",
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					tickEvent,
				);
			expect(
				newState.round,
			).toBeDefined();
			expect(
				newState
					.round
					.isRunning,
			).toBe(
				true,
			);
		});
	});

	describe("movePlayer", () => {
		it("should update player position", () => {
			const moveEvent: GameEvent =
				{
					type: "bulbroMoved",
					bulbroId:
						"player1",
					from: {
						x: 100,
						y: 100,
					},
					to: {
						x: 150,
						y: 120,
					},
					direction:
						{
							x: 1,
							y: 0.4,
						},
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				movePlayer(
					state,
					moveEvent,
				);
			const movedPlayer =
				newState.players.find(
					(
						p,
					) =>
						p.id ===
						"player1",
				);
			expect(
				movedPlayer
					?.position
					.x,
			).toBeGreaterThan(
				100,
			);
			expect(
				movedPlayer
					?.position
					.y,
			).toBeGreaterThan(
				100,
			);
		});

		it("should not affect other players", () => {
			const moveEvent: GameEvent =
				{
					type: "bulbroMoved",
					bulbroId:
						"player1",
					from: {
						x: 100,
						y: 100,
					},
					to: {
						x: 150,
						y: 120,
					},
					direction:
						{
							x: 1,
							y: 0.4,
						},
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				movePlayer(
					state,
					moveEvent,
				);
			const otherPlayer =
				newState.players.find(
					(
						p,
					) =>
						p.id ===
						"player2",
				);
			expect(
				otherPlayer?.position,
			).toEqual(
				{
					x: 200,
					y: 200,
				},
			);
		});
	});

	describe("handleBulbroHealed", () => {
		it("should heal the specified player", () => {
			// Create player with lower health by applying damage
			const damageEvent =
				player1.beHit(
					30,
					nowTime(
						Date.now(),
					),
				);
			const lowHealthPlayer =
				player1.applyEvent(
					withEventMeta(
						damageEvent,
						deltaTime(
							16,
						),
						nowTime(
							Date.now(),
						),
					),
				);
			state.players[0] =
				lowHealthPlayer;

			const healEvent: GameEvent =
				{
					type: "bulbroHealed",
					bulbroId:
						"player1",
					hp: 20,
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				handleBulbroHealed(
					state,
					healEvent,
				);
			const healedPlayer =
				newState.players.find(
					(
						p,
					) =>
						p.id ===
						"player1",
				);
			expect(
				healedPlayer?.healthPoints,
			).toBeGreaterThan(
				50,
			);
		});

		it("should not heal other players", () => {
			// Create player with lower health by applying damage
			const damageEvent =
				player2.beHit(
					30,
					nowTime(
						Date.now(),
					),
				);
			const lowHealthPlayer2 =
				player2.applyEvent(
					withEventMeta(
						damageEvent,
						deltaTime(
							16,
						),
						nowTime(
							Date.now(),
						),
					),
				);
			state.players[1] =
				lowHealthPlayer2;

			const healEvent: GameEvent =
				{
					type: "bulbroHealed",
					bulbroId:
						"player1",
					hp: 20,
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				handleBulbroHealed(
					state,
					healEvent,
				);
			const otherPlayer =
				newState.players.find(
					(
						p,
					) =>
						p.id ===
						"player2",
				);
			expect(
				otherPlayer?.healthPoints,
			).toBe(
				50,
			);
		});
	});

	describe("handleBulbroAttacked", () => {
		it("should update weapon lastStrikedAt for attacking player", () => {
			const weapon =
				createTestWeapon(
					"knife",
				);
			const playerWithWeapon =
				player1.useWeapons(
					[
						weapon,
					],
				);
			state.players[0] =
				playerWithWeapon;

			const attackEvent: GameEvent =
				{
					type: "bulbroAttacked",
					bulbroId:
						"player1",
					weaponId:
						weapon.id,
					targetId:
						"enemy1",
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				handleBulbroAttacked(
					state,
					attackEvent,
				);
			const attackingPlayer =
				newState.players.find(
					(
						p,
					) =>
						p.id ===
						"player1",
				);
			const weapon1 =
				attackingPlayer?.weapons.find(
					(
						w,
					) =>
						w.id ===
						weapon.id,
				);
			expect(
				weapon1?.lastStrikedAt,
			).toBeGreaterThan(
				0,
			);
		});
	});

	describe("handleEnemyAttacked", () => {
		it("should update weapon lastStrikedAt for attacking enemy", () => {
			const weapon =
				createTestWeaponDefinition(
					"orcGun",
				);
			const enemyCharacter =
				createTestEnemyCharacter(
					"enemy-char1",
					[
						weapon,
					],
				);
			const enemyWithWeapon =
				spawnEnemy(
					"enemy1",
					{
						x: 400,
						y: 400,
					},
					enemyCharacter,
				);
			state.enemies[0] =
				enemyWithWeapon;

			const weaponId =
				enemyWithWeapon
					.weapons[0]
					?.id;
			expect(
				weaponId,
			).toBeDefined();

			const attackEvent: GameEvent =
				{
					type: "enemyAttacked",
					enemyId:
						"enemy1",
					weaponId:
						weaponId!,
					targetId:
						"player1",
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				handleEnemyAttacked(
					state,
					attackEvent,
				);
			const attackingEnemy =
				newState.enemies.find(
					(
						e,
					) =>
						e.id ===
						"enemy1",
				);
			const weapon1 =
				attackingEnemy?.weapons.find(
					(
						w,
					) =>
						w.id ===
						weaponId,
				);
			expect(
				weapon1?.lastStrikedAt,
			).toBeGreaterThan(
				0,
			);
		});
	});

	describe("material collection and movement", () => {
		it("should generate material movement events when player is in pickup range", () => {
			// Create a player with enhanced pickup range
			const playerWithHarvesting =
				new BulbroState(
					{
						...player1.toJSON(),
						stats:
							{
								...player1.stats,
								pickupRange: 50,
							},
					},
				);
			state.players[0] =
				playerWithHarvesting;

			// Add material within pickup range
			state.objects =
				[
					{
						type: "material",
						id: "material1",
						position:
							{
								x: 130,
								y: 100,
							}, // 30 units from player1 at (100, 100)
						value: 15,
					},
				];

			// Test material movement event generation
			const events =
				generateMaterialMovementEvents(
					state,
					deltaTime(
						16,
					),
				);

			// Should generate a movement event since material is within pickup range
			expect(
				events.length,
			).toBe(
				1,
			);
			expect(
				events[0]
					?.type,
			).toBe(
				"materialMoved",
			);
			expect(
				events[0]
					?.materialId,
			).toBe(
				"material1",
			);
			const moveEvent =
				events[0] as Extract<
					(typeof events)[0],
					{
						type: "materialMoved";
					}
				>;
			expect(
				moveEvent.from,
			).toEqual(
				{
					x: 130,
					y: 100,
				},
			);
			// Material should move towards player
			expect(
				moveEvent
					.to
					.x,
			).toBeLessThan(
				130,
			);
		});

		it("should not generate material movement events when player is out of pickup range", () => {
			// Use default pickup range (20)
			state.objects =
				[
					{
						type: "material",
						id: "material1",
						position:
							{
								x: 200,
								y: 100,
							}, // 100 units from player1, outside pickup range
						value: 15,
					},
				];

			const events =
				generateMaterialMovementEvents(
					state,
					deltaTime(
						16,
					),
				);
			expect(
				events.length,
			).toBe(
				0,
			);
		});

		it("should handle material collection events", () => {
			// Add material to state
			state.objects =
				[
					{
						type: "material",
						id: "material1",
						position:
							{
								x: 100,
								y: 100,
							},
						value: 25,
					},
				];

			// Create a bulbro collection event
			const material =
				state
					.objects[0] as Material;
			const collectionEvent =
				player1.takeMaterial(
					material,
				);
			expect(
				collectionEvent.type,
			).toBe(
				"bulbroCollectedMaterial",
			);
			expect(
				collectionEvent.bulbroId,
			).toBe(
				"player1",
			);
			expect(
				collectionEvent.materialId,
			).toBe(
				"material1",
			);

			// Apply the collection event
			const newPlayer =
				player1.applyEvent(
					withEventMeta(
						collectionEvent,
						deltaTime(
							16,
						),
						nowTime(
							Date.now(),
						),
					),
				);
			// BulbroState should handle the collection appropriately
			expect(
				newPlayer,
			).toBeDefined();
		});

		it("should move materials towards closest player", () => {
			// Position player2 closer to material than player1
			const closerPlayer =
				new BulbroState(
					{
						...player2.toJSON(),
						position:
							{
								x: 150,
								y: 150,
							},
						stats:
							{
								...player2.stats,
								pickupRange: 100,
							},
					},
				);
			state.players[1] =
				closerPlayer;

			// Add material closer to player2
			state.objects =
				[
					{
						type: "material",
						id: "material1",
						position:
							{
								x: 160,
								y: 160,
							}, // Closer to player2 at (150, 150)
						value: 10,
					},
				];

			const events =
				generateMaterialMovementEvents(
					state,
					deltaTime(
						16,
					),
				);
			expect(
				events.length,
			).toBe(
				1,
			);

			// Material should move towards player2, not player1
			const event =
				events[0] as Extract<
					(typeof events)[0],
					{
						type: "materialMoved";
					}
				>;
			expect(
				event
					.to
					.x,
			).toBeLessThan(
				event
					.from
					.x,
			); // Moving left towards player2
			expect(
				event
					.to
					.y,
			).toBeLessThan(
				event
					.from
					.y,
			); // Moving up towards player2
		});

		it("should generate material collected events when material gets very close to player", () => {
			const playerWithPickupRange =
				new BulbroState(
					{
						...player1.toJSON(),
						stats:
							{
								...player1.stats,
								pickupRange: 50,
							},
					},
				);
			state.players[0] =
				playerWithPickupRange;

			// Add material very close to player (within collection threshold after movement)
			state.objects =
				[
					{
						type: "material",
						id: "material1",
						position:
							{
								x: 100.5,
								y: 100,
							}, // 0.5 units from player1 at (100, 100)
						value: 10,
					},
				];

			const events =
				generateMaterialMovementEvents(
					state,
					deltaTime(
						16,
					),
				);

			// Should generate a collection event since material gets very close to player
			expect(
				events.length,
			).toBe(
				1,
			);
			expect(
				events[0]
					?.type,
			).toBe(
				"materialCollected",
			);
			expect(
				events[0]
					?.materialId,
			).toBe(
				"material1",
			);
			const collectEvent =
				events[0] as Extract<
					(typeof events)[0],
					{
						type: "materialCollected";
					}
				>;
			expect(
				collectEvent.playerId,
			).toBe(
				"player1",
			);
		});
	});

	describe("shot mechanics", () => {
		it("should handle shot creation and movement", () => {
			const shot =
				createTestShot(
					"shot1",
					"player1",
					"player",
					100,
					100,
				);
			const shotEvent: GameEvent =
				{
					type: "shot",
					shot,
					weaponId:
						"weapon1",
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							Date.now(),
						),
				};

			const newState =
				updateState(
					state,
					shotEvent,
				);
			expect(
				newState.shots,
			).toHaveLength(
				1,
			);
			expect(
				newState
					.shots[0]
					?.id,
			).toBe(
				"shot1",
			);
			expect(
				newState
					.shots[0]
					?.position,
			).toEqual(
				{
					x: 100,
					y: 100,
				},
			);
		});

		describe("round state", () => {
			it("should end round when all players die", () => {
				// Create dead players by applying fatal damage
				const deathEvent1 =
					player1.beHit(
						player1.healthPoints,
						nowTime(
							Date.now(),
						),
					);
				const deathEvent2 =
					player2.beHit(
						player2.healthPoints,
						nowTime(
							Date.now(),
						),
					);
				const deadPlayer1 =
					player1.applyEvent(
						withEventMeta(
							deathEvent1,
							deltaTime(
								16,
							),
							nowTime(
								Date.now(),
							),
						),
					);
				const deadPlayer2 =
					player2.applyEvent(
						withEventMeta(
							deathEvent2,
							deltaTime(
								16,
							),
							nowTime(
								Date.now(),
							),
						),
					);
				state.players =
					[
						deadPlayer1,
						deadPlayer2,
					];

				// Just trigger a tick event to update the round state
				const tickEvent: GameEvent =
					{
						type: "tick",
						deltaTime:
							deltaTime(
								16,
							),
						occurredAt:
							nowTime(
								Date.now(),
							),
					};

				const newState =
					updateState(
						state,
						tickEvent,
					);
				expect(
					newState
						.round
						.isRunning,
				).toBe(
					false,
				);
				expect(
					newState
						.round
						.endedAt,
				).toBeDefined();
			});
		});

		describe("createInitialState", () => {
			it("should create valid initial state", () => {
				const players =
					[
						createTestPlayer(
							"player1",
						),
						createTestPlayer(
							"player2",
						),
					];
				const mapSize =
					{
						width: 800,
						height: 600,
					};

				const initialState =
					createInitialState(
						players,
						mapSize,
						1,
						1,
						1,
						0,
					);

				expect(
					initialState.players,
				).toHaveLength(
					2,
				);
				expect(
					initialState.enemies,
				).toHaveLength(
					0,
				);
				expect(
					initialState.shots,
				).toHaveLength(
					0,
				);
				expect(
					initialState.objects,
				).toHaveLength(
					0,
				);
				expect(
					initialState
						.round
						.isRunning,
				).toBe(
					true,
				);
				expect(
					initialState
						.round
						.wave,
				).toBe(
					1,
				);
				expect(
					initialState
						.round
						.duration,
				).toBe(
					25,
				);
				expect(
					initialState.mapSize,
				).toEqual(
					mapSize,
				);
			});
		});
	});
});
