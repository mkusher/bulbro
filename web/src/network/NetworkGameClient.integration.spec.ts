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
import type { WaveProcess } from "@/GameProcess";
import { PlayerMovementEventGenerator } from "@/GameProcess/event-generators/PlayerMovementEventGenerator";
import {
	type GameEvent,
	type GameEventQueue,
	withEventMetaMultiple,
} from "@/game-events/GameEvents";
import type { Logger } from "@/logger";
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
			id,
			type: "normal",
			position:
				{
					x,
					y: 100,
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

// The production channel still serializes and validates every delivered packet.
// Explicit delivery keeps the state-update ping-pong finite in each assertion.
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

	firstPacket() {
		const packet =
			this
				.sent[0];
		if (
			!packet
		)
			throw new Error(
				"No packet was sent",
			);
		return packet;
	}

	latest(
		typeName: WebsocketMessage["type"],
	): WebsocketMessage {
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
		return message;
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
	let pending: GameEvent[] =
		[];
	const queue: GameEventQueue =
		{
			addEvent(
				event,
			) {
				pending.push(
					event,
				);
			},
			flush() {
				const result =
					pending;
				pending =
					[];
				return result;
			},
		};
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

		guest.connection.deliver(
			host.connection.firstPacket(),
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
			2,
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

		guest.connection.deliver(
			host.connection.firstPacket(),
		);
		await Bun.sleep(
			5,
		);
		host.connection.deliver(
			JSON.stringify(
				guest.connection.latest(
					"game-state-updated-by-guest",
				),
			),
		);
		const hostUpdate =
			host.connection.latest(
				"game-state-updated-by-host",
			);
		expect(
			hostUpdate.version,
		).toBe(
			3,
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
});
