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
import type { PlayerControl } from "@/controls";
import type {
	GameEvent,
	GameEventQueue,
} from "@/game-events/GameEvents";
import { direction } from "@/geometry";
import type { Logger } from "@/logger";
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
import type {
	InGameCommunicationChannel,
	WebsocketMessage,
} from "./InGameCommunicationChannel";
import type { RemoteRepeatLastKnownDirectionControl } from "./RemoteControl";
import { StateSync } from "./StateSync";
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
		tick: mock(),
	} as any;
}

function createMockGameEventQueue(): GameEventQueue {
	const events: GameEvent[] =
		[];
	return {
		addEvent:
			mock(
				(
					event: GameEvent,
				) =>
					events.push(
						event,
					),
			),
		flush:
			mock(
				() => {
					const result =
						[
							...events,
						];
					events.length = 0;
					return result;
				},
			),
	};
}

function createMockInGameCommunicationChannel(): InGameCommunicationChannel {
	const messageHandlers: ((
		message: WebsocketMessage,
	) => void)[] =
		[];

	return {
		send: mock(
			async (
				message: any,
			) => {},
		),
		onMessage:
			mock(
				(
					handler: (
						message: WebsocketMessage,
					) => void,
				) => {
					messageHandlers.push(
						handler,
					);
				},
			),
		// Helper method to simulate receiving messages
		_simulateMessage:
			(
				message: WebsocketMessage,
			) => {
				messageHandlers.forEach(
					(
						handler,
					) =>
						handler(
							message,
						),
				);
			},
	} as any;
}

function createMockRemoteControl(): RemoteRepeatLastKnownDirectionControl {
	return {
		onMessage:
			mock(),
		direction:
			{
				x: 0,
				y: 0,
			}, // zero direction vector (no movement)
	} as any;
}

function createMockPlayerControl(): PlayerControl {
	return {
		direction:
			{
				x: 0,
				y: 0,
			}, // zero direction vector (no movement)
		isAttacking: false,
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
				}, // right direction vector
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

describe("StateSync", () => {
	let stateSync: StateSync;
	let currentState: Signal<WaveState>;
	let currentUser: Signal<User>;
	let mockLogger: Logger;
	let mockWaveProcess: WaveProcess;
	let mockGameEventQueue: GameEventQueue;
	let mockInGameCommunicationChannel: InGameCommunicationChannel & {
		_simulateMessage: (
			msg: WebsocketMessage,
		) => void;
	};
	let mockRemoteControl: RemoteRepeatLastKnownDirectionControl;
	let mockPlayerControl: PlayerControl;
	let stateUpdater: StateUpdater;

	const LOCAL_PLAYER_ID =
		"local-player";
	const REMOTE_PLAYER_ID =
		"remote-player";
	const GAME_ID =
		"test-game";

	beforeEach(
		() => {
			mockLogger =
				createMockLogger();
			mockWaveProcess =
				createMockWaveProcess(
					1000,
				);
			mockGameEventQueue =
				createMockGameEventQueue();
			mockInGameCommunicationChannel =
				createMockInGameCommunicationChannel() as any;
			mockRemoteControl =
				createMockRemoteControl();
			mockPlayerControl =
				createMockPlayerControl();
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

	describe("Host StateSync", () => {
		beforeEach(
			() => {
				stateSync =
					new StateSync(
						{
							logger:
								mockLogger,
							gameId:
								GAME_ID,
							localPlayerId:
								LOCAL_PLAYER_ID,
							isHost: true,
							inGameCommunicationChannel:
								mockInGameCommunicationChannel,
							stateUpdater,
							gameEventQueue:
								mockGameEventQueue,
							currentState,
							localPlayerControl:
								mockPlayerControl,
							remoteControl:
								mockRemoteControl,
							waveProcess:
								mockWaveProcess,
						},
					);
			},
		);

		it("should handle incoming guest state update and trigger ping pong", () => {
			stateSync.start();

			const guestMessage: WebsocketMessage =
				{
					type: "game-state-updated-by-guest",
					gameId:
						GAME_ID,
					version: 5,
					sentAt: 1000,
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
								},
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
									),
							},
						],
				};

			// Add some local events to the queue
			mockGameEventQueue.addEvent(
				{
					type: "bulbroMoved",
					bulbroId:
						LOCAL_PLAYER_ID,
					from: {
						x: 100,
						y: 100,
					},
					to: {
						x: 120,
						y: 100,
					},
					direction:
						direction(
							{
								x: 100,
								y: 100,
							},
							{
								x: 120,
								y: 100,
							},
						),
					deltaTime:
						deltaTime(
							16,
						),
					occurredAt:
						nowTime(
							1000,
						),
				},
			);

			// Simulate receiving the message
			mockInGameCommunicationChannel._simulateMessage(
				guestMessage,
			);

			// Should trigger wave process tick
			expect(
				mockWaveProcess.tick,
			).toHaveBeenCalled();

			// Should send response message with incremented version
			expect(
				mockInGameCommunicationChannel.send,
			).toHaveBeenCalledWith(
				expect.objectContaining(
					{
						type: "game-state-updated-by-host",
						version: 6, // version + 1
						gameId:
							GAME_ID,
					},
				),
			);
		});

		it("should handle messages with old versions by sending ping-pong", () => {
			stateSync.start();

			const initialCallCount =
				(
					mockInGameCommunicationChannel.send as any
				)
					.mock
					.calls
					.length;

			// Send initial message
			const firstMessage: WebsocketMessage =
				{
					type: "game-state-updated-by-guest",
					gameId:
						GAME_ID,
					version: 10,
					sentAt: 1000,
					events:
						[],
				};

			mockInGameCommunicationChannel._simulateMessage(
				firstMessage,
			);
			const callsAfterFirst =
				(
					mockInGameCommunicationChannel.send as any
				)
					.mock
					.calls
					.length;

			// Send older message - should trigger ping-pong to correct version
			const oldMessage: WebsocketMessage =
				{
					type: "game-state-updated-by-guest",
					gameId:
						GAME_ID,
					version: 8, // older version
					sentAt: 1100,
					events:
						[],
				};

			mockInGameCommunicationChannel._simulateMessage(
				oldMessage,
			);
			const callsAfterOld =
				(
					mockInGameCommunicationChannel.send as any
				)
					.mock
					.calls
					.length;

			// Should have sent ping-pong response to correct the version
			expect(
				callsAfterOld,
			).toBe(
				callsAfterFirst +
					1,
			);
		});

		it("should send local player position updates", () => {
			// Mock the player control to simulate movement
			mockPlayerControl.direction =
				{
					x: 1,
					y: 0,
				}; // right direction vector

			stateSync.start();

			// The effect should send position updates automatically
			// We can't directly test the effect timing, but we can verify the setup
			expect(
				mockInGameCommunicationChannel.send,
			).toHaveBeenCalledWith(
				expect.objectContaining(
					{
						type: "game-state-position-updated",
						gameId:
							GAME_ID,
						playerId:
							LOCAL_PLAYER_ID,
					},
				),
			);
		});
	});

	describe("Guest StateSync", () => {
		beforeEach(
			() => {
				stateSync =
					new StateSync(
						{
							logger:
								mockLogger,
							gameId:
								GAME_ID,
							localPlayerId:
								LOCAL_PLAYER_ID,
							isHost: false,
							inGameCommunicationChannel:
								mockInGameCommunicationChannel,
							stateUpdater,
							gameEventQueue:
								mockGameEventQueue,
							currentState,
							localPlayerControl:
								mockPlayerControl,
							remoteControl:
								mockRemoteControl,
							waveProcess:
								mockWaveProcess,
						},
					);
			},
		);

		it("should handle host state updates and respond", () => {
			stateSync.start();

			const hostMessage: WebsocketMessage =
				{
					type: "game-state-updated-by-host",
					gameId:
						GAME_ID,
					version: 3,
					sentAt: 1000,
					events:
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
							},
						],
				};

			mockInGameCommunicationChannel._simulateMessage(
				hostMessage,
			);

			// Should trigger wave process tick
			expect(
				mockWaveProcess.tick,
			).toHaveBeenCalled();

			// Should send guest response
			expect(
				mockInGameCommunicationChannel.send,
			).toHaveBeenCalledWith(
				expect.objectContaining(
					{
						type: "game-state-updated-by-guest",
						version: 4, // version + 1
						gameId:
							GAME_ID,
					},
				),
			);
		});

		it("should not respond to guest messages when guest", () => {
			stateSync.start();

			const sendCallsBefore =
				(
					mockInGameCommunicationChannel.send as any
				)
					.mock
					.calls
					.length;

			const guestMessage: WebsocketMessage =
				{
					type: "game-state-updated-by-guest",
					gameId:
						GAME_ID,
					version: 5,
					sentAt: 1000,
					events:
						[],
				};

			mockInGameCommunicationChannel._simulateMessage(
				guestMessage,
			);

			// Should not send additional messages (guest doesn't respond to guest messages)
			const sendCallsAfter =
				(
					mockInGameCommunicationChannel.send as any
				)
					.mock
					.calls
					.length;
			expect(
				sendCallsAfter,
			).toBe(
				sendCallsBefore,
			); // No additional calls for guest messages
		});
	});

	describe("Position conflict resolution", () => {
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
							isHost: false, // Guest receives host's authoritative position
						},
					);

				stateSync =
					new StateSync(
						{
							logger:
								mockLogger,
							gameId:
								GAME_ID,
							localPlayerId:
								LOCAL_PLAYER_ID,
							isHost: false,
							inGameCommunicationChannel:
								mockInGameCommunicationChannel,
							stateUpdater,
							gameEventQueue:
								mockGameEventQueue,
							currentState,
							localPlayerControl:
								mockPlayerControl,
							remoteControl:
								mockRemoteControl,
							waveProcess:
								mockWaveProcess,
						},
					);
			},
		);

		it("should resolve position conflicts by using latest timestamp", () => {
			stateSync.start();

			// Initial remote player position
			const initialRemotePlayer =
				currentState.value.players.find(
					(
						p,
					) =>
						p.id ===
						REMOTE_PLAYER_ID,
				);
			expect(
				initialRemotePlayer?.position,
			).toEqual(
				{
					x: 200,
					y: 200,
				},
			);

			// First: Remote player moves right (earlier timestamp)
			const rightMoveMessage: WebsocketMessage =
				{
					type: "game-state-position-updated",
					gameId:
						GAME_ID,
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
					sentAt: 900, // Earlier timestamp
				};

			mockInGameCommunicationChannel._simulateMessage(
				rightMoveMessage,
			);

			// Second: Remote player moves down (later timestamp)
			const downMoveMessage: WebsocketMessage =
				{
					type: "game-state-position-updated",
					gameId:
						GAME_ID,
					playerId:
						REMOTE_PLAYER_ID,
					position:
						{
							x: 200,
							y: 300,
						},
					direction:
						{
							x: 0,
							y: 1,
						}, // down direction vector
					version: 2,
					sentAt: 1100, // Later timestamp
				};

			mockInGameCommunicationChannel._simulateMessage(
				downMoveMessage,
			);

			// Should use the position from the message with later timestamp (down movement)
			const updatedRemotePlayer =
				currentState.value.players.find(
					(
						p,
					) =>
						p.id ===
						REMOTE_PLAYER_ID,
				);
			expect(
				updatedRemotePlayer
					?.position
					.y,
			).toBeGreaterThan(
				200,
			); // Should have moved down
			expect(
				updatedRemotePlayer?.lastDirection,
			).toEqual(
				{
					x: 0,
					y: 1,
				},
			); // down direction vector
		});
	});
});
