import {
	afterEach,
	expect,
	test,
} from "bun:test";
import { signal } from "@preact/signals";
import type { Logger } from "pino";
import { WebsocketGameController } from "../../../server/src/game-websocket-controller";
import { GamesRegistry } from "../../../server/src/games-registry";
import { BulbroState } from "../../../web/src/bulbro/BulbroState";
import { baseStats } from "../../../web/src/characters-definitions/base";
import type { PlayerControl } from "../../../web/src/controls";
import { babyEnemy } from "../../../web/src/enemies-definitions/baby";
import {
	EnemyState,
	spawnEnemy,
} from "../../../web/src/enemy/EnemyState";
import { RageRunningBehaviors } from "../../../web/src/enemy/RageRunningBehaviors";
import type { WaveProcess } from "../../../web/src/GameProcess";
import { PlayerMovementEventGenerator } from "../../../web/src/GameProcess/event-generators/PlayerMovementEventGenerator";
import {
	type GameEvent,
	withEventMetaMultiple,
} from "../../../web/src/game-events/GameEvents";
import { InMemoryGameEventQueue } from "../../../web/src/game-events/InMemoryGameEventQueue";
import type { User } from "../../../web/src/network/currentUser";
import { isLocallyAuthoritativeEvent } from "../../../web/src/network/networkEventFilter";
import { RemoteRepeatLastKnownDirectionControl } from "../../../web/src/network/RemoteControl";
import { StateSync } from "../../../web/src/network/StateSync";
import { StateUpdater } from "../../../web/src/network/StateUpdater";
import type { WebsocketConnection } from "../../../web/src/network/websocket/WebsocketConnection";
import { WebsocketInGameCommunicationChannel } from "../../../web/src/network/websocket/WebsocketInGameCommunicationChannel";
import {
	deltaTime,
	nowTime,
} from "../../../web/src/time";
import {
	updateState,
	type WaveState,
} from "../../../web/src/waveState";

const hostId =
	"host";
const guestId =
	"guest";
const errors: unknown[] =
	[];
const logger =
	{
		debug() {},
		info() {},
		warn() {},
		error(
			error: unknown,
		) {
			errors.push(
				error,
			);
		},
		child() {
			return this;
		},
	} as unknown as Logger;

class InMemoryConnection {
	forward?: (
		packet: string,
	) => void;
	readonly sent: string[] =
		[];
	#handler?: (
		event: MessageEvent<string>,
	) => void;

	sendObject(
		message: object,
	) {
		const packet =
			JSON.stringify(
				message,
			);
		this.sent.push(
			packet,
		);
		queueMicrotask(
			() =>
				this.forward?.(
					packet,
				),
		);
	}

	onMessage(
		handler: (
			event: MessageEvent<string>,
		) => void,
	) {
		this.#handler =
			handler;
		return () => {
			this.#handler =
				undefined;
		};
	}

	deliver(
		packet: string,
	) {
		queueMicrotask(
			() =>
				this.#handler?.(
					{
						data: packet,
					} as MessageEvent<string>,
				),
		);
	}
}

function player(
	id: string,
	x: number,
) {
	return new BulbroState(
		{
			statSources:
				[],
			id,
			type: "normal",
			position:
				{
					x,
					y: 100,
				},
			level: 1,
			totalExperience: 0,
			materialsAvailable: 0,
			healthPoints: 100,
			stats:
				{
					...baseStats,
					maxHp: 100,
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

function initialState(): WaveState {
	return {
		round:
			{
				isRunning: true,
				duration: 60_000,
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
				player(
					hostId,
					100,
				),
				player(
					guestId,
					200,
				),
			],
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

function createClient(
	isHost: boolean,
	gameId: string,
) {
	const localId =
		isHost
			? hostId
			: guestId;
	const remoteId =
		isHost
			? guestId
			: hostId;
	const state =
		signal(
			initialState(),
		);
	const user =
		signal<User>(
			{
				id: localId,
				username:
					localId,
			},
		);
	const connection =
		new InMemoryConnection();
	const channel =
		new WebsocketInGameCommunicationChannel(
			connection as unknown as WebsocketConnection,
			logger,
		);
	const direction =
		signal(
			isHost
				? {
						x: 1,
						y: 0,
					}
				: {
						x:
							-1,
						y: 0,
					},
		);
	const control: PlayerControl =
		{
			signal:
				direction,
			get direction() {
				return direction.value;
			},
			async start() {},
			async stop() {},
		};
	const remoteControl =
		new RemoteRepeatLastKnownDirectionControl(
			isHost,
			remoteId,
		);
	const queue =
		new InMemoryGameEventQueue();
	const process =
		{
			now: () =>
				nowTime(
					1000,
				),
			tick() {
				const controls =
					state.value.players.map(
						(
							p,
						) =>
							p.id ===
							localId
								? control
								: remoteControl,
					);
				const generated =
					new PlayerMovementEventGenerator(
						controls,
					);
				const events =
					withEventMetaMultiple(
						generated.generate(
							state.value,
							deltaTime(
								16,
							),
							nowTime(
								1000,
							),
						),
						deltaTime(
							16,
						),
						nowTime(
							1000,
						),
					).filter(
						(
							event,
						) =>
							isLocallyAuthoritativeEvent(
								event,
								isHost,
								localId,
							),
					);
				state.value =
					events.reduce(
						updateState,
						state.value,
					);
				for (const event of events)
					queue.addEvent(
						event,
					);
			},
		} as unknown as WaveProcess;
	const updater =
		new StateUpdater(
			{
				logger,
				currentState:
					state,
				currentUser:
					user,
				waveProcess:
					process,
				isHost,
			},
		);
	const sync =
		new StateSync(
			{
				logger,
				gameId,
				localPlayerId:
					localId,
				isHost,
				inGameCommunicationChannel:
					channel,
				stateUpdater:
					updater,
				gameEventQueue:
					queue,
				currentState:
					state,
				localPlayerControl:
					control,
				remoteControl,
				waveProcess:
					process,
			},
		);
	return {
		state,
		connection,
		process,
		queue,
		sync,
		updater,
		remoteControl,
	};
}

async function waitFor(
	condition: () => boolean,
) {
	for (
		let attempt = 0;
		attempt <
		50;
		attempt++
	) {
		if (
			condition()
		)
			return;
		await Bun.sleep(
			10,
		);
	}
	throw new Error(
		`Timed out waiting for network state: ${JSON.stringify(errors)}`,
	);
}

const activeClients: ReturnType<
	typeof createClient
>[] =
	[];
afterEach(
	async () => {
		for (const client of activeClients) {
			client.sync.stop();
			await client.remoteControl.stop();
		}
		activeClients.length = 0;
		errors.length = 0;
	},
);

async function createNetwork() {
	const rooms =
		new GamesRegistry();
	const lobby =
		rooms.registerLobby(
			{
				id: hostId,
				username:
					"Host",
			},
		);
	rooms.addPlayer(
		lobby.id,
		{
			id: guestId,
			username:
				"Guest",
		},
	);
	const host =
		createClient(
			true,
			lobby.id,
		);
	const guest =
		createClient(
			false,
			lobby.id,
		);
	activeClients.push(
		host,
		guest,
	);
	const connections =
		new Map<
			string,
			{
				sendObject(
					message: object,
				): void;
			}
		>(
			[
				[
					hostId,
					{
						sendObject:
							(
								message,
							) =>
								host.connection.deliver(
									JSON.stringify(
										message,
									),
								),
					},
				],
				[
					guestId,
					{
						sendObject:
							(
								message,
							) =>
								guest.connection.deliver(
									JSON.stringify(
										message,
									),
								),
					},
				],
			],
		);
	const relay =
		new WebsocketGameController(
			logger,
			{
				rooms,
				connections,
			},
		);
	host.connection.forward =
		(
			packet,
		) =>
			relay.routeMessage(
				hostId,
				JSON.parse(
					packet,
				),
			);
	guest.connection.forward =
		(
			packet,
		) =>
			relay.routeMessage(
				guestId,
				JSON.parse(
					packet,
				),
			);
	await host.remoteControl.start();
	await guest.remoteControl.start();
	host.sync.start();
	guest.sync.start();
	return {
		rooms,
		lobby,
		host,
		guest,
		connections,
		relay,
	};
}

function batches(
	connection: InMemoryConnection,
	type: string,
) {
	return connection.sent
		.map(
			(
				packet,
			) =>
				JSON.parse(
					packet,
				) as {
					type: string;
					version?: number;
				},
		)
		.filter(
			(
				message,
			) =>
				message.type ===
				type,
		);
}

function playerX(
	state: WaveState,
	playerId: string,
) {
	return state.players.find(
		(
			player,
		) =>
			player.id ===
			playerId,
	)
		?.position
		.x;
}

test("host and guest converge through the in-memory server relay", async () => {
	const {
		lobby,
		host,
		guest,
	} =
		await createNetwork();

	guest.process.tick();
	await waitFor(
		() =>
			guest.connection.sent.some(
				(
					packet,
				) =>
					JSON.parse(
						packet,
					)
						.type ===
					"game-state-updated-by-guest",
			),
	);
	await waitFor(
		() => {
			const guestX =
				guest.state.value.players.find(
					(
						p,
					) =>
						p.id ===
						guestId,
				)
					?.position
					.x;
			return (
				guestX !==
					undefined &&
				guestX <
					200 &&
				host.state.value.players.find(
					(
						p,
					) =>
						p.id ===
						guestId,
				)
					?.position
					.x ===
					guestX
			);
		},
	);
	expect(
		guest.connection.sent.some(
			(
				packet,
			) =>
				JSON.parse(
					packet,
				)
					.type ===
				"game-state-updated-by-guest",
		),
	).toBe(
		true,
	);

	host.process.tick();
	await waitFor(
		() =>
			host.connection.sent.some(
				(
					packet,
				) =>
					JSON.parse(
						packet,
					)
						.type ===
					"game-state-updated-by-host",
			),
	);
	await waitFor(
		() => {
			const hostX =
				host.state.value.players.find(
					(
						p,
					) =>
						p.id ===
						hostId,
				)
					?.position
					.x;
			return (
				hostX !==
					undefined &&
				hostX >
					100 &&
				guest.state.value.players.find(
					(
						p,
					) =>
						p.id ===
						hostId,
				)
					?.position
					.x ===
					hostX
			);
		},
	);
	expect(
		host.connection.sent.some(
			(
				packet,
			) =>
				JSON.parse(
					packet,
				)
					.type ===
				"game-state-updated-by-host",
		),
	).toBe(
		true,
	);

	const spawnEvent: GameEvent =
		{
			type: "spawnEnemy",
			enemy:
				spawnEnemy(
					"relay-enemy",
					{
						x: 400,
						y: 400,
					},
					{
						...babyEnemy,
						behaviors:
							"rage-running",
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
		};
	host.state.value =
		updateState(
			host
				.state
				.value,
			spawnEvent,
		);
	host.queue.addEvent(
		spawnEvent,
	);
	await waitFor(
		() =>
			guest.state.value.objects.some(
				(
					object,
				) =>
					object.type ===
						"spawning-enemy" &&
					object
						.enemy
						.id ===
						"relay-enemy",
			),
	);
	const spawning =
		guest.state.value.objects.find(
			(
				object,
			) =>
				object.type ===
					"spawning-enemy" &&
				object
					.enemy
					.id ===
					"relay-enemy",
		);
	if (
		spawning?.type !==
		"spawning-enemy"
	)
		throw new Error(
			"Enemy was not relayed",
		);
	expect(
		spawning.enemy,
	).toBeInstanceOf(
		EnemyState,
	);
	expect(
		spawning
			.enemy
			.behaviors,
	).toBeInstanceOf(
		RageRunningBehaviors,
	);
	await Bun.sleep(
		40,
	);
	const guestPositionPackets =
		guest.connection.sent.filter(
			(
				packet,
			) =>
				JSON.parse(
					packet,
				)
					.type ===
				"game-state-position-updated",
		).length;
	host.connection.sendObject(
		{
			type: "game-state-position-updated",
			gameId:
				lobby.id,
			playerId:
				hostId,
			position:
				{
					x: 150,
					y: 100,
				},
			direction:
				{
					x: 1,
					y: 0,
				},
			version: 100,
			sentAt:
				Date.now(),
		},
	);
	await waitFor(
		() =>
			guest.state.value.players.find(
				(
					p,
				) =>
					p.id ===
					hostId,
			)
				?.position
				.x ===
			150,
	);
	await Bun.sleep(
		40,
	);
	expect(
		guest.connection.sent.filter(
			(
				packet,
			) =>
				JSON.parse(
					packet,
				)
					.type ===
				"game-state-position-updated",
		)
			.length,
	).toBe(
		guestPositionPackets,
	);
	expect(
		errors,
	).toEqual(
		[],
	);
});

test("repeated exchanges converge and replayed event batches are ignored", async () => {
	const {
		host,
		guest,
		relay,
	} =
		await createNetwork();
	for (
		let turn = 1;
		turn <=
		3;
		turn++
	) {
		guest.process.tick();
		await waitFor(
			() =>
				batches(
					guest.connection,
					"game-state-updated-by-guest",
				)
					.length ===
				turn,
		);
		await waitFor(
			() =>
				playerX(
					host
						.state
						.value,
					guestId,
				) ===
				playerX(
					guest
						.state
						.value,
					guestId,
				),
		);
		await waitFor(
			() =>
				host
					.remoteControl
					.direction
					.x ===
					-1 &&
				playerX(
					host.updater.getLastSyncedState(),
					guestId,
				) ===
					playerX(
						guest
							.state
							.value,
						guestId,
					),
		);

		host.process.tick();
		await waitFor(
			() =>
				batches(
					host.connection,
					"game-state-updated-by-host",
				)
					.length ===
				turn,
		);
		await waitFor(
			() =>
				guest
					.remoteControl
					.direction
					.x ===
					1 &&
				playerX(
					guest.updater.getLastSyncedState(),
					hostId,
				) ===
					playerX(
						host
							.state
							.value,
						hostId,
					),
		);
		await waitFor(
			() =>
				playerX(
					guest
						.state
						.value,
					hostId,
				) ===
				playerX(
					host
						.state
						.value,
					hostId,
				),
		);
		expect(
			batches(
				guest.connection,
				"game-state-updated-by-guest",
			).at(
				-1,
			)
				?.version,
		).toBe(
			turn,
		);
		expect(
			batches(
				host.connection,
				"game-state-updated-by-host",
			).at(
				-1,
			)
				?.version,
		).toBe(
			turn,
		);
	}

	await Bun.sleep(
		30,
	);
	const beforeReplay =
		host
			.state
			.value;
	const firstBatch =
		guest.connection.sent.find(
			(
				packet,
			) =>
				JSON.parse(
					packet,
				)
					.type ===
				"game-state-updated-by-guest",
		);
	if (
		!firstBatch
	)
		throw new Error(
			"Guest sent no event batch",
		);
	const latestBatch =
		guest.connection.sent
			.filter(
				(
					packet,
				) =>
					JSON.parse(
						packet,
					)
						.type ===
					"game-state-updated-by-guest",
			)
			.at(
				-1,
			);
	if (
		!latestBatch
	)
		throw new Error(
			"Guest sent no latest event batch",
		);
	relay.routeMessage(
		guestId,
		JSON.parse(
			latestBatch,
		),
	);
	relay.routeMessage(
		guestId,
		JSON.parse(
			firstBatch,
		),
	);
	await Bun.sleep(
		1,
	);
	expect(
		host
			.state
			.value,
	).toBe(
		beforeReplay,
	);
	expect(
		playerX(
			host
				.state
				.value,
			guestId,
		),
	).toBe(
		playerX(
			guest
				.state
				.value,
			guestId,
		),
	);
	expect(
		playerX(
			guest
				.state
				.value,
			hostId,
		),
	).toBe(
		playerX(
			host
				.state
				.value,
			hostId,
		),
	);
	expect(
		errors,
	).toEqual(
		[],
	);
});

test("a known guest resumes receiving movement after reconnecting", async () => {
	const {
		rooms,
		lobby,
		host,
		guest,
		connections,
	} =
		await createNetwork();
	connections.delete(
		guestId,
	);
	rooms.markDisconnected(
		lobby.id,
		guestId,
	);

	host.process.tick();
	await waitFor(
		() =>
			batches(
				host.connection,
				"game-state-updated-by-host",
			)
				.length ===
			1,
	);
	expect(
		playerX(
			guest
				.state
				.value,
			hostId,
		),
	).toBe(
		100,
	);
	expect(
		rooms
			.find(
				lobby.id,
			)
			?.players.find(
				(
					player,
				) =>
					player.id ===
					guestId,
			)
			?.status,
	).toBe(
		"offline",
	);

	connections.set(
		guestId,
		{
			sendObject:
				(
					message,
				) =>
					guest.connection.deliver(
						JSON.stringify(
							message,
						),
					),
		},
	);
	rooms.markConnected(
		lobby.id,
		guestId,
	);
	host.process.tick();
	await waitFor(
		() =>
			batches(
				host.connection,
				"game-state-updated-by-host",
			)
				.length ===
			2,
	);
	await waitFor(
		() =>
			playerX(
				guest
					.state
					.value,
				hostId,
			) ===
			playerX(
				host
					.state
					.value,
				hostId,
			),
	);
	expect(
		playerX(
			guest
				.state
				.value,
			hostId,
		),
	).toBeGreaterThan(
		100,
	);
	expect(
		rooms
			.find(
				lobby.id,
			)
			?.players.find(
				(
					player,
				) =>
					player.id ===
					guestId,
			)
			?.status,
	).toBe(
		"connected",
	);
	expect(
		errors,
	).toEqual(
		[],
	);
});
