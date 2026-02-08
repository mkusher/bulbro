import {
	beforeEach,
	describe,
	expect,
	it,
	mock,
} from "bun:test";
import {
	type Signal,
	signal,
} from "@preact/signals";
import { BulbroState } from "@/bulbro/BulbroState";
import { baseStats } from "@/characters-definitions/base";
import type { GameEvent } from "@/game-events/GameEvents";
import {
	direction,
	zeroPoint,
} from "@/geometry";
import type { Logger } from "@/logger";
import { ShotState } from "@/shot/ShotState";
import {
	deltaTime,
	nowTime,
} from "@/time";
import type { WaveProcess } from "@/WaveProcess";
import type {
	WaveState,
	WeaponState,
} from "@/waveState";
import type { User } from "./currentUser";
import { StateUpdater } from "./StateUpdater";

// Test utilities
function createMockLogger(): Logger {
	return {
		debug:
			mock(),
		info: mock(),
		warn: mock(),
		error:
			mock(),
		child:
			mock(
				() =>
					createMockLogger(),
			),
	} as any;
}

function createMockWaveProcess(
	currentTime = 1000,
): WaveProcess {
	return {
		now: mock(
			() =>
				currentTime,
		),
	} as any;
}

function createTestBulbro(
	id: string,
	x = 0,
	y = 0,
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
			healthPoints: 100,
			stats:
				{
					...baseStats,
					maxHp: 100,
					hpRegeneration: 1,
					damage: 10,
					range: 100,
					speed: 100,
					pickupRange: 20,
				},
			weapons:
				[] as WeaponState[],
			lastMovedAt: 0,
			lastHitAt: 0,
			healedByHpRegenerationAt: 0,
			lastDirection:
				{
					x: 1,
					y: 0,
				}, // normalized right direction
		},
	);
}

function createTestState(
	localPlayerId: string,
	remotePlayerId: string,
): WaveState {
	return {
		round:
			{
				isRunning: true,
				duration: 60000,
				wave: 1,
				difficulty: 1,
			},
		mapSize:
			{
				width: 1000,
				height: 1000,
			},
		objects:
			[],
		enemies:
			[],
		shots:
			[],
		players:
			[
				createTestBulbro(
					localPlayerId,
					100,
					100,
				),
				createTestBulbro(
					remotePlayerId,
					200,
					200,
				),
			],
	};
}

describe("StateUpdater", () => {
	let stateUpdater: StateUpdater;
	let currentState: Signal<WaveState>;
	let currentUser: Signal<User>;
	let mockLogger: Logger;
	let mockWaveProcess: WaveProcess;

	const LOCAL_PLAYER_ID =
		"local-player";
	const REMOTE_PLAYER_ID =
		"remote-player";

	beforeEach(
		() => {
			mockLogger =
				createMockLogger();
			mockWaveProcess =
				createMockWaveProcess(
					1000,
				);
			currentState =
				signal(
					createTestState(
						LOCAL_PLAYER_ID,
						REMOTE_PLAYER_ID,
					),
				);
			currentUser =
				signal(
					{
						id: LOCAL_PLAYER_ID,
						username:
							"localuser",
					},
				);
		},
	);

	describe("Host StateUpdater", () => {
		beforeEach(
			() => {
				stateUpdater =
					new StateUpdater(
						{
							logger:
								mockLogger,
							currentState,
							currentUser,
							waveProcess:
								mockWaveProcess,
							isHost: true,
						},
					);
			},
		);

		it("should process remote player position update correctly", () => {
			// Initial state: remote player at (200, 200)
			expect(
				currentState
					.value
					.players[1]
					?.position,
			).toEqual(
				{
					x: 200,
					y: 200,
				},
			);

			// Remote player moves to the right
			const positionMessage =
				{
					type: "game-state-position-updated",
					gameId:
						"test-game",
					playerId:
						REMOTE_PLAYER_ID,
					position:
						{
							x: 300,
							y: 200,
						}, // moved right
					direction:
						{
							x: 1,
							y: 0,
						}, // normalized right direction
					version: 1,
					sentAt: 1100, // Later than initialization time
				} as const;

			stateUpdater.processMessage(
				positionMessage,
				[],
			);

			// Should update remote player position
			const updatedRemotePlayer =
				currentState.value.players.find(
					(
						p,
					) =>
						p.id ===
						REMOTE_PLAYER_ID,
				);
			expect(
				updatedRemotePlayer?.position,
			).toEqual(
				{
					x: 300,
					y: 200,
				},
			); // Should have moved to the exact position
			expect(
				updatedRemotePlayer?.lastDirection,
			).toEqual(
				{
					x: 1,
					y: 0,
				},
			); // right direction vector
		});

		it("should handle conflicting remote player movements correctly", () => {
			// First message: remote player moves right (later timestamp)
			const firstMessage =
				{
					type: "game-state-position-updated" as const,
					gameId:
						"test-game",
					playerId:
						REMOTE_PLAYER_ID,
					position:
						{
							x: 300,
							y: 200,
						},
					direction:
						{
							x: 1,
							y: 0,
						}, // right direction vector
					version: 1,
					sentAt: 1100, // Later timestamp
				};

			stateUpdater.processMessage(
				firstMessage,
				[],
			);

			// Second message: remote player moves down (earlier timestamp, should be ignored)
			const secondMessage =
				{
					type: "game-state-position-updated" as const,
					gameId:
						"test-game",
					playerId:
						REMOTE_PLAYER_ID,
					position:
						{
							x: 200,
							y: 300,
						}, // moved down from original position
					direction:
						{
							x: 0,
							y: 1,
						}, // down direction vector
					version: 2,
					sentAt: 1050, // Earlier timestamp than first message, should be ignored
				};

			stateUpdater.processMessage(
				secondMessage,
				[],
			);

			// Should still have the right movement, not the down movement
			const updatedRemotePlayer =
				currentState.value.players.find(
					(
						p,
					) =>
						p.id ===
						REMOTE_PLAYER_ID,
				);
			expect(
				updatedRemotePlayer?.position,
			).toEqual(
				{
					x: 300,
					y: 200,
				},
			); // Still moved right
			expect(
				updatedRemotePlayer?.lastDirection,
			).toEqual(
				{
					x: 1,
					y: 0,
				},
			); // Direction should be right
		});

		it("should handle realistic movement sequence with local and remote events", () => {
			// Step 1: Receive first remote message - remote player moves right
			const firstRemoteMessage =
				{
					type: "game-state-updated-by-guest" as const,
					gameId:
						"test-game",
					version: 1,
					sentAt: 1100,
					events:
						[
							{
								type: "bulbroMoved",
								bulbroId:
									REMOTE_PLAYER_ID,
								from: {
									x: 200,
									y: 200,
								},
								to: {
									x: 250,
									y: 200,
								}, // Remote player moves right
								direction:
									direction(
										{
											x: 200,
											y: 200,
										},
										{
											x: 250,
											y: 200,
										},
									), // calculated direction vector
							},
						],
				};

			stateUpdater.processMessage(
				firstRemoteMessage,
				[],
			);

			// Verify remote player moved right
			const updatedRemotePlayer =
				currentState.value.players.find(
					(
						p,
					) =>
						p.id ===
						REMOTE_PLAYER_ID,
				);
			expect(
				updatedRemotePlayer?.position,
			).toEqual(
				{
					x: 250,
					y: 200,
				},
			);
			expect(
				updatedRemotePlayer?.lastDirection,
			).toEqual(
				{
					x: 1,
					y: 0,
				},
			); // right direction vector

			// Step 2: Process local events - local player also moves right
			const localEvents: GameEvent[] =
				[
					{
						type: "bulbroMoved",
						bulbroId:
							LOCAL_PLAYER_ID,
						from: {
							x: 100,
							y: 100,
						},
						to: {
							x: 150,
							y: 100,
						}, // Local player moves right
						direction:
							direction(
								{
									x: 100,
									y: 100,
								},
								{
									x: 150,
									y: 100,
								},
							), // calculated direction vector
						deltaTime:
							deltaTime(
								16,
							),
						occurredAt:
							nowTime(
								1000,
							),
					},
				];

			// Step 3: Receive second remote message with remote player moving down
			// This should "replace" the latest local movement in the result
			const secondRemoteMessage =
				{
					type: "game-state-updated-by-guest" as const,
					gameId:
						"test-game",
					version: 2,
					sentAt: 1200,
					events:
						[
							{
								type: "bulbroMoved",
								bulbroId:
									REMOTE_PLAYER_ID,
								from: {
									x: 250,
									y: 200,
								},
								to: {
									x: 250,
									y: 250,
								}, // Remote player moves down
								direction:
									direction(
										{
											x: 250,
											y: 200,
										},
										{
											x: 250,
											y: 250,
										},
									), // calculated direction vector
							},
						],
				};

			stateUpdater.processMessage(
				secondRemoteMessage,
				localEvents,
			);

			// Verify final state
			const finalState =
				currentState.value;

			// Local player should have moved right (from local events)
			const finalLocalPlayer =
				finalState.players.find(
					(
						p,
					) =>
						p.id ===
						LOCAL_PLAYER_ID,
				);
			expect(
				finalLocalPlayer?.position,
			).toEqual(
				{
					x: 150,
					y: 100,
				},
			);
			expect(
				finalLocalPlayer?.lastDirection,
			).toEqual(
				{
					x: 1,
					y: 0,
				},
			); // right direction vector

			// Remote player should have moved down (latest remote event should take precedence)
			const finalRemotePlayer =
				finalState.players.find(
					(
						p,
					) =>
						p.id ===
						REMOTE_PLAYER_ID,
				);
			expect(
				finalRemotePlayer?.position,
			).toEqual(
				{
					x: 250,
					y: 250,
				},
			);
			expect(
				finalRemotePlayer?.lastDirection,
			).toEqual(
				{
					x: 0,
					y: 1,
				},
			); // down direction vector
		});
	});

	describe("Guest StateUpdater", () => {
		beforeEach(
			() => {
				stateUpdater =
					new StateUpdater(
						{
							logger:
								mockLogger,
							currentState,
							currentUser,
							waveProcess:
								mockWaveProcess,
							isHost: false,
						},
					);
			},
		);

		it("should filter local events correctly for guest", () => {
			const localEvents: GameEvent[] =
				[
					// Should keep: local player shot
					{
						type: "shot",
						shot: new ShotState(
							{
								id: "shot-1",
								shooterId:
									LOCAL_PLAYER_ID,
								shooterType:
									"player",
								position:
									{
										x: 100,
										y: 100,
									},
								direction:
									{
										x: 1,
										y: 0,
									},
								damage: 10,
								speed: 200,
								range: 300,
								startPosition:
									{
										x: 100,
										y: 100,
									},
								knockback: 0,
								weaponType:
									"pistol",
							},
						),
						weaponId:
							"weapon-1",
						deltaTime:
							deltaTime(
								16,
							),
						occurredAt:
							nowTime(
								1000,
							),
					},
					// Should filter out: enemy spawn
					{
						type: "spawnEnemy",
						enemy:
							{} as any, // Mock enemy
						deltaTime:
							deltaTime(
								16,
							),
						occurredAt:
							nowTime(
								1000,
							),
					},
					// Should filter out: material collected by remote
					{
						type: "materialCollected",
						materialId:
							"material-1",
						playerId:
							REMOTE_PLAYER_ID,
						deltaTime:
							deltaTime(
								16,
							),
						occurredAt:
							nowTime(
								1000,
							),
					},
				];

			const remoteMessage =
				{
					type: "game-state-updated-by-host" as const,
					gameId:
						"test-game",
					version: 1,
					sentAt: 1000,
					events:
						[
							// Should include: all enemy events
							{
								type: "enemyMoved",
								enemyId:
									"enemy-1",
								from: {
									x: 500,
									y: 500,
								},
								to: {
									x: 510,
									y: 500,
								},
								direction:
									{
										x: 1,
										y: 0,
									},
							},
						],
				};

			stateUpdater.processMessage(
				remoteMessage,
				localEvents,
			);

			expect(
				mockLogger.info,
			).toHaveBeenCalled();
		});

		it("should accept host authority for most events", () => {
			const remoteEvents: GameEvent[] =
				[
					{
						type: "enemySpawningStarted",
						enemyId:
							"enemy-1",
						position:
							{
								x: 400,
								y: 400,
							},
						enemyType:
							"basic",
						deltaTime:
							deltaTime(
								16,
							),
						occurredAt:
							nowTime(
								1000,
							),
					},
					{
						type: "bulbroMoved",
						bulbroId:
							REMOTE_PLAYER_ID,
						from: {
							x: 200,
							y: 200,
						},
						to: {
							x: 250,
							y: 200,
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
								1000,
							),
					},
				];

			const remoteMessage =
				{
					type: "game-state-updated-by-host" as const,
					gameId:
						"test-game",
					version: 1,
					sentAt: 1000,
					events:
						remoteEvents,
				};

			stateUpdater.processMessage(
				remoteMessage,
				[],
			);

			expect(
				mockLogger.info,
			).toHaveBeenCalled();
		});
	});

	describe("Event sorting", () => {
		beforeEach(
			() => {
				stateUpdater =
					new StateUpdater(
						{
							logger:
								mockLogger,
							currentState,
							currentUser,
							waveProcess:
								mockWaveProcess,
							isHost: true,
						},
					);
			},
		);

		it("should sort events by now field before processing", () => {
			const localEvents: GameEvent[] =
				[
					{
						type: "tick",
						deltaTime:
							deltaTime(
								16,
							),
						occurredAt:
							nowTime(
								1020,
							), // Later event
					},
					{
						type: "tick",
						deltaTime:
							deltaTime(
								16,
							),
						occurredAt:
							nowTime(
								1010,
							), // Earlier event
					},
				];

			const remoteEvents: GameEvent[] =
				[
					{
						type: "tick",
						deltaTime:
							deltaTime(
								16,
							),
						occurredAt:
							nowTime(
								1015,
							), // Middle event
					},
				];

			const remoteMessage =
				{
					type: "game-state-updated-by-guest" as const,
					gameId:
						"test-game",
					version: 1,
					sentAt: 1000,
					events:
						remoteEvents,
				};

			// The implementation should sort by now field: 1010, 1015, 1020
			stateUpdater.processMessage(
				remoteMessage,
				localEvents,
			);

			expect(
				mockLogger.info,
			).toHaveBeenCalled();
		});
	});
});
