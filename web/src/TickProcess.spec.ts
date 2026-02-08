import {
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import { signal } from "@preact/signals";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { BulbroState } from "./bulbro";
import { EnemyState } from "./enemy";
import { InMemoryGameEventQueue } from "./game-events/GameEventQueue";
import type { GameEventQueue } from "./game-events/GameEvents";
import type { StageWithUi } from "./graphics/StageWithUi";
import { logger } from "./logger";
import { ShotState } from "./shot/ShotState";
import { TickProcess } from "./TickProcess";
import type { WaveState } from "./waveState";

/**
 * Create a mock stage for testing
 */
function createMockStage(): unknown {
	return {
		update:
			() => {},
	};
}

/**
 * Helper to create a test shot
 */
function createTestShot(
	id: string,
	shooterId: string,
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

/**
 * Helper to create a test enemy
 */
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

/**
 * Helper to create a test player
 */
function createTestPlayer(
	id: string,
	x = 100,
	y = 100,
	weapons: any = [],
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
			healthPoints: 80,
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
			lastDirection:
				{
					x: 1,
					y: 0,
				},
		},
	);
}

/**
 * Helper to create a test weapon
 */
function createTestWeapon(
	id = "weapon1",
	type:
		| "pistol"
		| "laserGun" = "pistol",
): any {
	return {
		id,
		type,
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

describe("TickProcess", () => {
	let tickProcess: TickProcess;
	let eventQueue: GameEventQueue;
	let stage: unknown;
	let state: WaveState;

	beforeEach(
		() => {
			eventQueue =
				new InMemoryGameEventQueue();
			stage =
				createMockStage();

			// Create initial state
			const now =
				Date.now();
			state =
				{
					mapSize:
						{
							width: 800,
							height: 600,
						},
					players:
						[
							createTestPlayer(
								"player1",
								100,
								100,
							),
							createTestPlayer(
								"player2",
								200,
								200,
							),
						],
					enemies:
						[],
					shots:
						[],
					objects:
						[],
					round:
						{
							isRunning: true,
							duration: 60,
							wave: 1,
							difficulty: 1,
							startedAt:
								now,
							endedAt:
								undefined,
						},
				};

			// Create TickProcess
			const stateSignal =
				signal<WaveState | null>(
					state,
				);
			tickProcess =
				new TickProcess(
					logger.child(
						{
							component:
								"TickProcessTest",
						},
					),
					stage as StageWithUi,
					[], // Empty controls for testing
					eventQueue,
					stateSignal,
					false,
				);
		},
	);

	describe("shot collision detection", () => {
		it("should generate enemyReceivedHit event when player shot hits enemy", () => {
			// Create enemy in path of shot
			const enemy =
				createTestEnemy(
					"enemy1",
					100,
					100,
				);
			state.enemies =
				[
					enemy,
				];

			// Create player shot very close to enemy, moving right
			const shot =
				createTestShot(
					"shot1",
					"player1",
					"player",
					80,
					100,
					{
						x: 1,
						y: 0,
					},
				);
			state.shots =
				[
					shot,
				];

			// Run tick with large deltaTime to ensure collision
			tickProcess.tick(
				state,
				deltaTime(
					100,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that enemyReceivedHit event was generated
			const events =
				eventQueue.flush();
			const hitEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"enemyReceivedHit",
				);

			expect(
				hitEvent,
			).toBeDefined();
			expect(
				hitEvent?.enemyId,
			).toBe(
				"enemy1",
			);
		});

		it("should generate bulbroReceivedHit event when enemy shot hits player", () => {
			// Create enemy shot aimed at player
			const shot =
				new ShotState(
					{
						id: "shot1",
						shooterId:
							"enemy1",
						shooterType:
							"enemy",
						startPosition:
							{
								x: 120,
								y: 100,
							},
						position:
							{
								x: 120,
								y: 100,
							},
						direction:
							{
								x:
									-1,
								y: 0,
							},
						speed: 200,
						damage: 15,
						range: 300,
						knockback: 0,
						weaponType:
							"laserGun",
					},
				);
			state.shots =
				[
					shot,
				];

			// Run tick with large deltaTime to ensure collision
			tickProcess.tick(
				state,
				deltaTime(
					100,
				),
				nowTime(
					Date.now(),
				),
			);
			state.shots =
				[
					shot,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that bulbroReceivedHit event was generated
			const events =
				eventQueue.flush();
			const hitEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"bulbroReceivedHit",
				);

			expect(
				hitEvent,
			).toBeDefined();
			expect(
				hitEvent?.bulbroId,
			).toBe(
				"player1",
			);
		});

		it("should generate shotExpired event when shot goes out of bounds", () => {
			// Create shot near boundary moving out
			const shot =
				createTestShot(
					"shot1",
					"player1",
					"player",
					790,
					100,
					{
						x: 1,
						y: 0,
					},
				);
			state.shots =
				[
					shot,
				];

			// Run tick with enough deltaTime to go out of bounds
			tickProcess.tick(
				state,
				deltaTime(
					100,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that shotExpired event was generated
			const events =
				eventQueue.flush();
			const expiredEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"shotExpired",
				);

			expect(
				expiredEvent,
			).toBeDefined();
			expect(
				expiredEvent?.shotId,
			).toBe(
				"shot1",
			);
		});

		it("should generate shotExpired event when shot exceeds range", () => {
			// Create shot with limited range
			const shot =
				new ShotState(
					{
						id: "shot1",
						shooterId:
							"player1",
						shooterType:
							"player",
						startPosition:
							{
								x: 0,
								y: 100,
							},
						position:
							{
								x: 500,
								y: 100,
							},
						direction:
							{
								x: 1,
								y: 0,
							},
						speed: 200,
						damage: 10,
						range: 100,
						knockback: 0,
						weaponType:
							"pistol",
					},
				);
			state.shots =
				[
					shot,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that shotExpired event was generated
			const events =
				eventQueue.flush();
			const expiredEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"shotExpired",
				);

			expect(
				expiredEvent,
			).toBeDefined();
		});

		it("should generate shotMoved event when shot doesn't hit anything", () => {
			// Create shot far from enemies (shoot upward)
			const shot =
				createTestShot(
					"shot1",
					"player1",
					"player",
					100,
					100,
					{
						x: 0,
						y:
							-1,
					},
				);
			state.shots =
				[
					shot,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that shotMoved event was generated
			const events =
				eventQueue.flush();
			const moveEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"shotMoved",
				);

			expect(
				moveEvent,
			).toBeDefined();
			expect(
				moveEvent?.shotId,
			).toBe(
				"shot1",
			);
		});
	});

	describe("event generation", () => {
		it("should add all events to the queue", () => {
			// Create a shot to move
			const shot =
				createTestShot(
					"shot1",
					"player1",
					"player",
					100,
					100,
				);
			state.shots =
				[
					shot,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Get all events
			const events =
				eventQueue.flush();

			// Should have at least shotMoved and tick events
			expect(
				events.length,
			).toBeGreaterThan(
				0,
			);

			// Should have tick event
			const tickEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"tick",
				);
			expect(
				tickEvent,
			).toBeDefined();
		});

		it("should include event metadata (deltaTime, occurredAt) on all events", () => {
			const shot =
				createTestShot(
					"shot1",
					"player1",
					"player",
					100,
					100,
				);
			state.shots =
				[
					shot,
				];

			const now =
				nowTime(
					Date.now(),
				);
			const dt =
				deltaTime(
					16,
				);

			// Run tick
			tickProcess.tick(
				state,
				dt,
				now,
			);

			// Get all events
			const events =
				eventQueue.flush();

			// All events should have metadata
			for (const event of events) {
				expect(
					event.deltaTime,
				).toBeDefined();
				expect(
					event.occurredAt,
				).toBeDefined();
			}
		});

		it("should generate tick event on every tick", () => {
			// Run tick without any shots
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Get all events
			const events =
				eventQueue.flush();

			// Should have tick event
			const tickEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"tick",
				);

			expect(
				tickEvent,
			).toBeDefined();
		});
	});

	describe("event flow", () => {
		it("should generate hit event AND shotExpired event on collision", () => {
			// Create enemy in path of shot
			const enemy =
				createTestEnemy(
					"enemy1",
					100,
					100,
				);
			state.enemies =
				[
					enemy,
				];

			// Create player shot aimed at enemy
			const shot =
				createTestShot(
					"shot1",
					"player1",
					"player",
					80,
					100,
					{
						x: 1,
						y: 0,
					},
				);
			state.shots =
				[
					shot,
				];

			// Run tick with large deltaTime to ensure collision
			tickProcess.tick(
				state,
				deltaTime(
					100,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that both events were generated
			const events =
				eventQueue.flush();
			const hitEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"enemyReceivedHit",
				);
			const expiredEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"shotExpired",
				);

			expect(
				hitEvent,
			).toBeDefined();
			expect(
				expiredEvent,
			).toBeDefined();
			expect(
				expiredEvent?.shotId,
			).toBe(
				"shot1",
			);
		});

		it("should handle multiple shots in same tick", () => {
			// Create two shots
			const shot1 =
				createTestShot(
					"shot1",
					"player1",
					"player",
					100,
					100,
				);
			const shot2 =
				createTestShot(
					"shot2",
					"player1",
					"player",
					100,
					200,
				);

			state.shots =
				[
					shot1,
					shot2,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Get all events
			const events =
				eventQueue.flush();
			const shotMovedEvents =
				events.filter(
					(
						e,
					) =>
						e.type ===
						"shotMoved",
				);

			// Should have move events for both shots
			expect(
				shotMovedEvents.length,
			).toBe(
				2,
			);
		});
	});

	describe("bulbroAttacked events", () => {
		it("should generate bulbroAttacked event when player attacks enemy", () => {
			// Create weapon
			const weapon =
				{
					id: "weapon1",
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

			// Create player with a weapon
			const player =
				createTestPlayer(
					"player1",
					100,
					100,
					[
						weapon,
					],
				);
			state.players =
				[
					player,
				];
			state.players =
				[
					player,
				];

			// Create enemy in range
			const enemy =
				createTestEnemy(
					"enemy1",
					150,
					100,
				);
			state.enemies =
				[
					enemy,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that bulbroAttacked event was generated
			const events =
				eventQueue.flush();
			const attackEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"bulbroAttacked",
				);

			expect(
				attackEvent,
			).toBeDefined();
			expect(
				attackEvent?.bulbroId,
			).toBe(
				"player1",
			);
			expect(
				attackEvent?.weaponId,
			).toBe(
				"weapon1",
			);
		});

		it("should include target information in bulbroAttacked event", () => {
			// Create weapon
			const weapon =
				{
					id: "weapon1",
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

			// Create player with a weapon
			const player =
				createTestPlayer(
					"player1",
					100,
					100,
					[
						weapon,
					],
				);
			state.players =
				[
					player,
				];
			state.players =
				[
					player,
				];

			// Create enemy in range
			const enemy =
				createTestEnemy(
					"enemy1",
					150,
					100,
				);
			state.enemies =
				[
					enemy,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that bulbroAttacked event includes target
			const events =
				eventQueue.flush();
			const attackEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"bulbroAttacked",
				);

			expect(
				attackEvent?.targetId,
			).toBe(
				"enemy1",
			);
			expect(
				attackEvent?.shot,
			).toBeDefined();
		});

		it("should generate shot event along with bulbroAttacked event", () => {
			// Create weapon
			const weapon =
				createTestWeapon();

			// Create player with a weapon
			const player =
				createTestPlayer(
					"player1",
					100,
					100,
					[
						weapon,
					],
				);
			state.players =
				[
					player,
				];

			// Create enemy in range
			const enemy =
				createTestEnemy(
					"enemy1",
					150,
					100,
				);
			state.enemies =
				[
					enemy,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that both bulbroAttacked and shot events were generated
			const events =
				eventQueue.flush();
			const attackEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"bulbroAttacked",
				);
			const shotEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"shot",
				);

			expect(
				attackEvent,
			).toBeDefined();
			expect(
				shotEvent,
			).toBeDefined();
		});

		it("should not generate bulbroAttacked event if no enemies in range", () => {
			// Create weapon
			const weapon =
				createTestWeapon();

			// Create player with a weapon
			const player =
				createTestPlayer(
					"player1",
					100,
					100,
					[
						weapon,
					],
				);
			state.players =
				[
					player,
				];

			// Create enemy far away from range
			const enemy =
				createTestEnemy(
					"enemy1",
					400,
					400,
				);
			state.enemies =
				[
					enemy,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that no bulbroAttacked event was generated
			const events =
				eventQueue.flush();
			const attackEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"bulbroAttacked",
				);

			expect(
				attackEvent,
			).toBeUndefined();
		});

		it("should not generate bulbroAttacked event if player is dead", () => {
			// Create weapon
			const weapon =
				createTestWeapon();

			// Create dead player (with 0 health)
			const player =
				new BulbroState(
					{
						id: "player1",
						type: "normal",
						level: 1,
						totalExperience: 0,
						position:
							{
								x: 100,
								y: 100,
							},
						speed: 200,
						healthPoints: 0,
						weapons:
							[
								weapon,
							],
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
						lastDirection:
							{
								x: 1,
								y: 0,
							},
					},
				);
			state.players =
				[
					player,
				];

			// Create enemy in range
			const enemy =
				createTestEnemy(
					"enemy1",
					150,
					100,
				);
			state.enemies =
				[
					enemy,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that no bulbroAttacked event was generated
			const events =
				eventQueue.flush();
			const attackEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"bulbroAttacked",
				);

			expect(
				attackEvent,
			).toBeUndefined();
		});

		it("should generate multiple bulbroAttacked events for multiple players", () => {
			// Create weapons
			const weapon1 =
				createTestWeapon(
					"weapon1",
					"pistol",
				);
			const weapon2 =
				{
					id: "weapon2",
					type: "laserGun" as const,
					lastStrikedAt: 0,
					statsBonus:
						{
							damage: 8,
							attackSpeed: 1.5,
						},
					shotSpeed: 250,
					aimingDirection:
						{
							x:
								-1,
							y: 0,
						},
				};

			// Create two players with weapons
			const player1 =
				createTestPlayer(
					"player1",
					100,
					100,
					[
						weapon1,
					],
				);

			const player2 =
				createTestPlayer(
					"player2",
					200,
					200,
					[
						weapon2,
					],
				);

			state.players =
				[
					player1,
					player2,
				];

			// Create enemies in range of both players
			const enemy1 =
				createTestEnemy(
					"enemy1",
					150,
					100,
				);
			const enemy2 =
				createTestEnemy(
					"enemy2",
					150,
					200,
				);
			state.enemies =
				[
					enemy1,
					enemy2,
				];

			// Run tick
			tickProcess.tick(
				state,
				deltaTime(
					16,
				),
				nowTime(
					Date.now(),
				),
			);

			// Check that bulbroAttacked events for both players were generated
			const events =
				eventQueue.flush();
			const attackEvents =
				events.filter(
					(
						e,
					) =>
						e.type ===
						"bulbroAttacked",
				);

			expect(
				attackEvents.length,
			).toBe(
				2,
			);
			expect(
				attackEvents.some(
					(
						e,
					) =>
						e.bulbroId ===
						"player1",
				),
			).toBe(
				true,
			);
			expect(
				attackEvents.some(
					(
						e,
					) =>
						e.bulbroId ===
						"player2",
				),
			).toBe(
				true,
			);
		});

		it("should include event metadata in bulbroAttacked events", () => {
			// Create weapon
			const weapon =
				createTestWeapon();

			// Create player with a weapon
			const player =
				createTestPlayer(
					"player1",
					100,
					100,
					[
						weapon,
					],
				);
			state.players =
				[
					player,
				];

			// Create enemy in range
			const enemy =
				createTestEnemy(
					"enemy1",
					150,
					100,
				);
			state.enemies =
				[
					enemy,
				];

			const now =
				nowTime(
					Date.now(),
				);
			const dt =
				deltaTime(
					16,
				);

			// Run tick
			tickProcess.tick(
				state,
				dt,
				now,
			);

			// Check that bulbroAttacked event has metadata
			const events =
				eventQueue.flush();
			const attackEvent =
				events.find(
					(
						e,
					) =>
						e.type ===
						"bulbroAttacked",
				);

			expect(
				attackEvent?.deltaTime,
			).toBeDefined();
			expect(
				attackEvent?.occurredAt,
			).toBeDefined();
		});
	});
});
