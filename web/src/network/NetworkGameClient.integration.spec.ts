import {
	afterEach,
	describe,
	expect,
	it,
} from "bun:test";
import { signal } from "@preact/signals";
import { type } from "arktype";
import { BulbroState } from "@/bulbro/BulbroState";
import { baseStats } from "@/characters-definitions/base";
import type { PlayerControl } from "@/controls";
import { babyEnemy } from "@/enemies-definitions/baby";
import {
	EnemyState,
	spawnEnemy,
} from "@/enemy/EnemyState";
import { RageRunningBehaviors } from "@/enemy/RageRunningBehaviors";
import type { WaveProcess } from "@/GameProcess";
import { PlayerMovementEventGenerator } from "@/GameProcess/event-generators/PlayerMovementEventGenerator";
import {
	type GameEvent,
	withEventMetaMultiple,
} from "@/game-events/GameEvents";
import { InMemoryGameEventQueue } from "@/game-events/InMemoryGameEventQueue";
import type { Logger } from "@/logger";
import { ShotState } from "@/shot/ShotState";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	updateState,
	type WaveState,
} from "@/waveState";
import type { User } from "./currentUser";
import { WebsocketMessage } from "./InGameCommunicationChannel";
import { isLocallySimulatedEvent } from "./networkEventFilter";
import { RemoteRepeatLastKnownDirectionControl } from "./RemoteControl";
import { StateSync } from "./StateSync";
import { StateUpdater } from "./StateUpdater";
import type { WebsocketConnection } from "./websocket/WebsocketConnection";
import { WebsocketInGameCommunicationChannel } from "./websocket/WebsocketInGameCommunicationChannel";

const gameId =
	"shared-game";
const hostId =
	"host";
const guestId =
	"guest";
const quietLogger =
	{
		debug() {},
		info() {},
		warn() {},
		child() {
			return this;
		},
	} as unknown as Logger;

function player(
	id: string,
	x: number,
): BulbroState {
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

// The production channel serializes and validates every delivered packet.
// Explicit delivery makes each simulated network exchange deterministic.
class WireConnection {
	readonly sent: string[] =
		[];
	#handler?: (
		event: MessageEvent<string>,
	) => void;

	sendObject(
		message: object,
	) {
		this.sent.push(
			JSON.stringify(
				message,
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
		this.#handler?.(
			{
				data: packet,
			} as MessageEvent<string>,
		);
	}

	latest<
		T extends
			WebsocketMessage["type"],
	>(
		typeName: T,
	): Extract<
		WebsocketMessage,
		{
			type: T;
		}
	> {
		const packet =
			[
				...this
					.sent,
			]
				.reverse()
				.find(
					(
						raw,
					) =>
						JSON.parse(
							raw,
						)
							.type ===
						typeName,
				);
		if (
			!packet
		)
			throw new Error(
				`No ${typeName} packet was sent`,
			);
		const message =
			WebsocketMessage(
				JSON.parse(
					packet,
				),
			);
		if (
			message instanceof
			type.errors
		)
			throw message;
		return message as Extract<
			WebsocketMessage,
			{
				type: T;
			}
		>;
	}
}

function makeClient(
	isHost: boolean,
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
		new WireConnection();
	const channel =
		new WebsocketInGameCommunicationChannel(
			connection as unknown as WebsocketConnection,
			quietLogger,
		);
	const controlDirection =
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
				controlDirection,
			get direction() {
				return controlDirection.value;
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
				const generated =
					new PlayerMovementEventGenerator(
						state.value.players.map(
							(
								player,
							) =>
								player.id ===
								localId
									? control
									: remoteControl,
						),
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
							isLocallySimulatedEvent(
								event,
								isHost,
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
				logger:
					quietLogger,
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
				logger:
					quietLogger,
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
		sync,
		remoteControl,
		process,
		queue,
	};
}

const activeClients: ReturnType<
	typeof makeClient
>[] =
	[];
afterEach(
	async () => {
		for (const client of activeClients) {
			client.sync.stop();
			await client.remoteControl.stop();
		}
		activeClients.length = 0;
	},
);

describe("network game client integration", () => {
	for (const isHost of [
		true,
		false,
	]) {
		it(
			"predicts remote movement between packets and calibrates stops: " +
				isHost,
			async () => {
				const client =
					makeClient(
						isHost,
					);
				activeClients.push(
					client,
				);
				await client.remoteControl.start();
				client.sync.start();
				const remoteId =
					isHost
						? guestId
						: hostId;
				const remote =
					() =>
						client.state.value.players.find(
							(
								p,
							) =>
								p.id ===
								remoteId,
						)!;
				const deliver =
					(
						version: number,
						x: number,
						direction: number,
					) =>
						client.connection.deliver(
							JSON.stringify(
								{
									type: "game-state-position-updated",
									gameId,
									playerId:
										remoteId,
									position:
										{
											x,
											y: 100,
										},
									direction:
										{
											x: direction,
											y: 0,
										},
									version,
									sentAt: 1000,
								},
							),
						);
				deliver(
					1,
					300,
					1,
				);
				client.process.tick();
				const first =
					remote()
						.position
						.x;
				expect(
					first,
				).toBeGreaterThan(
					300,
				);
				client.process.tick();
				expect(
					remote()
						.position
						.x,
				).toBeGreaterThan(
					first,
				);
				deliver(
					3,
					305,
					0,
				);
				expect(
					remote()
						.position
						.x,
				).toBe(
					305,
				);
				deliver(
					2,
					302,
					1,
				);
				client.process.tick();
				expect(
					remote()
						.position
						.x,
				).toBe(
					305,
				);
				await Bun.sleep(
					60,
				);
				const sent =
					client.connection.latest(
						isHost
							? "game-state-updated-by-host"
							: "game-state-updated-by-guest",
					);
				expect(
					(
						sent?.events as GameEvent[]
					).some(
						(
							event,
						) =>
							event.type ===
								"bulbroMoved" &&
							event.bulbroId ===
								remoteId,
					),
				).toBe(
					false,
				);
			},
		);
	}

	it("generates guest movement, sends it to the host, and updates host state", async () => {
		const host =
			makeClient(
				true,
			);
		const guest =
			makeClient(
				false,
			);
		activeClients.push(
			host,
			guest,
		);
		await host.remoteControl.start();
		await guest.remoteControl.start();
		host.sync.start();
		guest.sync.start();

		guest.process.tick();
		await Bun.sleep(
			60,
		);
		const guestUpdate =
			guest.connection.latest(
				"game-state-updated-by-guest",
			);
		expect(
			guestUpdate.gameId,
		).toBe(
			gameId,
		);
		expect(
			guestUpdate.version,
		).toBe(
			1,
		);
		if (
			guestUpdate.type !==
			"game-state-updated-by-guest"
		)
			throw new Error(
				"Wrong packet type",
			);
		const guestMove =
			guestUpdate.events.find(
				(
					event,
				) =>
					(
						event as {
							type?: string;
						}
					)
						.type ===
					"bulbroMoved",
			);
		expect(
			guestMove,
		).toMatchObject(
			{
				bulbroId:
					guestId,
				direction:
					{
						x:
							-1,
						y: 0,
					},
			},
		);

		host.connection.deliver(
			JSON.stringify(
				guestUpdate,
			),
		);
		expect(
			host.state.value.players.find(
				(
					p,
				) =>
					p.id ===
					guestId,
			)
				?.position
				.x,
		).toBeLessThan(
			200,
		);
	});

	it("generates host movement, sends it to the guest, and updates guest state", async () => {
		const host =
			makeClient(
				true,
			);
		const guest =
			makeClient(
				false,
			);
		activeClients.push(
			host,
			guest,
		);
		await host.remoteControl.start();
		await guest.remoteControl.start();
		host.sync.start();
		guest.sync.start();

		guest.process.tick();
		await Bun.sleep(
			60,
		);
		host.connection.deliver(
			JSON.stringify(
				guest.connection.latest(
					"game-state-updated-by-guest",
				),
			),
		);
		host.process.tick();
		await Bun.sleep(
			60,
		);
		const hostUpdate =
			host.connection.latest(
				"game-state-updated-by-host",
			);
		expect(
			hostUpdate.version,
		).toBe(
			1,
		);
		if (
			hostUpdate.type !==
			"game-state-updated-by-host"
		)
			throw new Error(
				"Wrong packet type",
			);
		expect(
			hostUpdate.events,
		).toContainEqual(
			expect.objectContaining(
				{
					type: "bulbroMoved",
					bulbroId:
						hostId,
					direction:
						{
							x: 1,
							y: 0,
						},
				},
			),
		);

		guest.connection.deliver(
			JSON.stringify(
				hostUpdate,
			),
		);
		expect(
			guest.state.value.players.find(
				(
					p,
				) =>
					p.id ===
					hostId,
			)
				?.position
				.x,
		).toBeGreaterThan(
			100,
		);
	});

	it("calibrates remote predictions on repeated exchanges without extra receive ticks", async () => {
		const host =
			makeClient(
				true,
			);
		const guest =
			makeClient(
				false,
			);
		activeClients.push(
			host,
			guest,
		);
		await host.remoteControl.start();
		await guest.remoteControl.start();
		host.sync.start();
		guest.sync.start();

		for (
			let turn = 0;
			turn <
			3;
			turn++
		) {
			guest.process.tick();
			await Bun.sleep(
				60,
			);
			const guestUpdate =
				guest.connection.latest(
					"game-state-updated-by-guest",
				);
			host.connection.deliver(
				JSON.stringify(
					guestUpdate,
				),
			);
			host.process.tick();
			await Bun.sleep(
				60,
			);
			const hostUpdate =
				host.connection.latest(
					"game-state-updated-by-host",
				);
			guest.connection.deliver(
				JSON.stringify(
					hostUpdate,
				),
			);
			const guestPlayer =
				guest.state.value.players.find(
					(
						p,
					) =>
						p.id ===
						guestId,
				)!;
			const predictedMove =
				guestPlayer.move(
					{
						x:
							-1,
						y: 0,
					},
					guest
						.state
						.value
						.mapSize,
					[],
					deltaTime(
						16,
					),
				)!;
			const predictedGuest =
				guestPlayer.applyEvent(
					{
						...predictedMove,
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
			expect(
				host.state.value.players.find(
					(
						p,
					) =>
						p.id ===
						guestId,
				)!
					.position,
			).toEqual(
				predictedGuest.position,
			);

			expect(
				guest.state.value.players.find(
					(
						p,
					) =>
						p.id ===
						hostId,
				)
					?.position,
			).toEqual(
				host.state.value.players.find(
					(
						p,
					) =>
						p.id ===
						hostId,
				)
					?.position,
			);
			const beforeDuplicate =
				host
					.state
					.value;
			host.connection.deliver(
				JSON.stringify(
					guestUpdate,
				),
			);
			expect(
				host
					.state
					.value,
			).toBe(
				beforeDuplicate,
			);
		}
	});

	it("accepts the first position packet after a state batch", async () => {
		const host =
			makeClient(
				true,
			);
		const guest =
			makeClient(
				false,
			);
		activeClients.push(
			host,
			guest,
		);
		host.sync.start();
		guest.sync.start();
		host.process.tick();
		await Bun.sleep(
			60,
		);
		guest.connection.deliver(
			JSON.stringify(
				host.connection.latest(
					"game-state-updated-by-host",
				),
			),
		);
		guest.connection.deliver(
			JSON.stringify(
				{
					type: "game-state-position-updated",
					gameId,
					playerId:
						hostId,
					position:
						{
							x: 140,
							y: 100,
						},
					direction:
						{
							x: 1,
							y: 0,
						},
					version: 0,
					sentAt: 1000,
				},
			),
		);
		expect(
			guest.state.value.players.find(
				(
					p,
				) =>
					p.id ===
					hostId,
			)
				?.position,
		).toEqual(
			{
				x: 140,
				y: 100,
			},
		);
	});

	it("hydrates host world events on the guest after JSON transport", async () => {
		const host =
			makeClient(
				true,
			);
		const guest =
			makeClient(
				false,
			);
		activeClients.push(
			host,
			guest,
		);
		host.sync.start();
		guest.sync.start();
		const enemy =
			spawnEnemy(
				"enemy-1",
				{
					x: 400,
					y: 400,
				},
				{
					...babyEnemy,
					behaviors:
						"rage-running",
				},
			);
		host.queue.addEvent(
			{
				type: "spawnEnemy",
				enemy,
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
		await Bun.sleep(
			60,
		);
		guest.connection.deliver(
			JSON.stringify(
				host.connection.latest(
					"game-state-updated-by-host",
				),
			),
		);
		const spawning =
			guest.state.value.objects.find(
				(
					object,
				) =>
					object.type ===
					"spawning-enemy",
			);
		expect(
			spawning?.enemy,
		).toBeInstanceOf(
			EnemyState,
		);
		expect(
			spawning
				?.enemy
				.behaviors,
		).toBeInstanceOf(
			RageRunningBehaviors,
		);
	});

	it("hydrates a relayed projectile before the guest simulates another frame", async () => {
		const host =
			makeClient(
				true,
			);
		const guest =
			makeClient(
				false,
			);
		activeClients.push(
			host,
			guest,
		);
		host.sync.start();
		guest.sync.start();
		const shot =
			new ShotState(
				{
					id: "shot-1",
					shooterId:
						"enemy-1",
					shooterType:
						"enemy",
					position:
						{
							x: 100,
							y: 100,
						},
					startPosition:
						{
							x: 100,
							y: 100,
						},
					direction:
						{
							x: 1,
							y: 0,
						},
					damage: 1,
					speed: 100,
					range: 300,
					knockback: 0,
					weaponType:
						"pistol",
				},
			);
		host.queue.addEvent(
			{
				type: "shot",
				shot,
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
		);
		await Bun.sleep(
			60,
		);
		guest.connection.deliver(
			JSON.stringify(
				host.connection.latest(
					"game-state-updated-by-host",
				),
			),
		);
		expect(
			guest
				.state
				.value
				.shots[0],
		).toBeInstanceOf(
			ShotState,
		);
		expect(
			guest.state.value.shots[0]?.move(
				{
					x: 110,
					y: 100,
				},
			)
				.type,
		).toBe(
			"shotMoved",
		);
	});
});
