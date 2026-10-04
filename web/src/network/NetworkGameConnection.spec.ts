import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock,
} from "bun:test";
import { BulbroState } from "@/bulbro/BulbroState";
import { baseStats } from "@/characters-definitions/base";
import { isRound } from "@/currentGameProcess";
import type {
	GameProcess,
	WaveProcess,
} from "@/GameProcess";
import { InMemoryGameEventQueue } from "@/game-events/InMemoryGameEventQueue";
import type { Logger } from "@/logger";
import { nowTime } from "@/time";
import {
	type WaveState,
	waveState,
} from "@/waveState";
import { currentUser } from "./currentUser";
import type {
	InGameCommunicationChannel,
	ProcessMessage,
	WebsocketMessage,
} from "./InGameCommunicationChannel";
import { NetworkGameConnection } from "./NetworkGameConnection";

const gameId =
	"game-1";
const hostId =
	"host";
const guestId =
	"guest";
const quietLogger =
	{
		debug() {},
		info() {},
		warn() {},
		error() {},
		child() {
			return this;
		},
	} as unknown as Logger;

function player(
	id: string,
	materialsAvailable = 0,
): BulbroState {
	return new BulbroState(
		{
			statSources:
				[],
			id,
			type: "normal",
			characterId:
				"well-rounded",
			position:
				{
					x: 0,
					y: 0,
				},
			level: 1,
			totalExperience: 0,
			materialsAvailable,
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

function finishedFirstWave(
	localId: string,
): WaveState {
	const players =
		[
			player(
				hostId,
				5,
			),
			player(
				guestId,
				7,
			),
		];
	return {
		round:
			{
				isRunning: false,
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
			localId ===
			hostId
				? players
				: players.reverse(),
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

class FakeChannel
	implements
		InGameCommunicationChannel
{
	readonly sent: WebsocketMessage[] =
		[];
	#listeners: ProcessMessage[] =
		[];

	async send(
		message: WebsocketMessage,
	) {
		this.sent.push(
			message,
		);
	}

	onMessage(
		f: ProcessMessage,
	) {
		this.#listeners.push(
			f,
		);
		return () => {
			this.#listeners =
				this.#listeners.filter(
					(
						l,
					) =>
						l !==
						f,
				);
		};
	}

	deliver(
		message: WebsocketMessage,
	) {
		for (const listener of this
			.#listeners)
			listener(
				message,
			);
	}
}

function makeConnection(
	localId: string,
) {
	currentUser.value =
		{
			id: localId,
			username:
				localId,
		};
	waveState.value =
		finishedFirstWave(
			localId,
		);
	const channel =
		new FakeChannel();
	const waveProcess =
		{
			now: () =>
				nowTime(
					0,
				),
			tick() {},
			eventQueue:
				new InMemoryGameEventQueue(),
		} as unknown as WaveProcess;
	const wave =
		Promise.withResolvers<"win">();
	const startWave =
		mock(
			() => ({
				waveInitPromise:
					Promise.resolve(
						waveProcess,
					),
				wavePromise:
					wave.promise,
			}),
		);
	const setEventFilter =
		mock(
			() => {},
		);
	const gameProcess =
		{
			startWave,
			setEventFilter,
		} as unknown as GameProcess;
	const connection =
		new NetworkGameConnection(
			quietLogger,
			channel,
			{
				id: gameId,
				createdAt: 0,
				hostId,
				players:
					[
						{
							id: hostId,
							username:
								hostId,
						},
						{
							id: guestId,
							username:
								guestId,
						},
					],
				readyPlayers:
					[],
			},
			gameProcess,
			localId ===
				hostId,
		);
	return {
		channel,
		connection,
		startWave,
		setEventFilter,
		finishWave:
			() =>
				wave.resolve(
					"win",
				),
	};
}

describe("NetworkGameConnection next wave", () => {
	let finishWave =
		() => {};

	beforeEach(
		() => {
			isRound.value = false;
		},
	);
	afterEach(
		() => {
			finishWave();
		},
	);

	it("sends the local player's shop results when ready", async () => {
		const {
			channel,
			connection,
		} =
			makeConnection(
				guestId,
			);

		await connection.markReadyForNextWave();

		expect(
			channel.sent,
		).toEqual(
			[
				expect.objectContaining(
					{
						type: "next-wave-player-ready",
						gameId,
						wave: 2,
						playerId:
							guestId,
						player:
							expect.objectContaining(
								{
									id: guestId,
									materialsAvailable: 7,
								},
							),
					},
				),
			],
		);
		expect(
			connection
				.readyForNextWave
				.value,
		).toEqual(
			[
				guestId,
			],
		);
	});

	it("withdraws the local player's readiness", async () => {
		const {
			channel,
			connection,
		} =
			makeConnection(
				guestId,
			);

		await connection.markReadyForNextWave();
		await connection.markNotReadyForNextWave();

		expect(
			channel.sent.at(
				-1,
			),
		).toEqual(
			expect.objectContaining(
				{
					type: "next-wave-player-not-ready",
					gameId,
					wave: 2,
					playerId:
						guestId,
				},
			),
		);
		expect(
			connection
				.readyForNextWave
				.value,
		).toEqual(
			[],
		);
	});

	it("clears the remote player's readiness when they are not ready", () => {
		const {
			channel,
			connection,
		} =
			makeConnection(
				hostId,
			);

		channel.deliver(
			{
				type: "next-wave-player-ready",
				gameId,
				wave: 2,
				playerId:
					guestId,
				player:
					{
						id: guestId,
						characterId:
							"well-rounded",
					},
				sentAt: 0,
			},
		);
		channel.deliver(
			{
				type: "next-wave-player-not-ready",
				gameId,
				wave: 2,
				playerId:
					guestId,
				sentAt: 0,
			},
		);

		expect(
			connection
				.readyForNextWave
				.value,
		).toEqual(
			[],
		);
	});

	it("tracks the remote player's readiness for the upcoming wave only", () => {
		const {
			channel,
			connection,
		} =
			makeConnection(
				hostId,
			);

		channel.deliver(
			{
				type: "next-wave-player-ready",
				gameId,
				wave: 3,
				playerId:
					guestId,
				player:
					{
						id: guestId,
						characterId:
							"well-rounded",
					},
				sentAt: 0,
			},
		);
		expect(
			connection
				.readyForNextWave
				.value,
		).toEqual(
			[],
		);

		channel.deliver(
			{
				type: "next-wave-player-ready",
				gameId,
				wave: 2,
				playerId:
					guestId,
				player:
					{
						id: guestId,
						characterId:
							"well-rounded",
					},
				sentAt: 0,
			},
		);
		expect(
			connection
				.readyForNextWave
				.value,
		).toEqual(
			[
				guestId,
			],
		);
	});

	it("starts the next wave with server states, local player first and shared positions", async () => {
		const host =
			makeConnection(
				hostId,
			);
		finishWave =
			host.finishWave;
		const players =
			[
				player(
					hostId,
					1,
				).toJSON(),
				player(
					guestId,
					2,
				).toJSON(),
			];

		host.channel.deliver(
			{
				type: "next-wave-started",
				gameId,
				wave: 2,
				players,
				serverStartTime: 0,
			},
		);
		await Promise.resolve();
		const hostState =
			waveState.value;

		const guest =
			makeConnection(
				guestId,
			);
		guest.channel.deliver(
			{
				type: "next-wave-started",
				gameId,
				wave: 2,
				players,
				serverStartTime: 0,
			},
		);
		await Promise.resolve();
		const guestState =
			waveState.value;
		guest.finishWave();

		expect(
			host.startWave,
		).toHaveBeenCalledTimes(
			1,
		);
		// Set in the constructor and again for the next wave.
		expect(
			host.setEventFilter,
		).toHaveBeenCalledTimes(
			2,
		);
		expect(
			guest.startWave,
		).toHaveBeenCalledTimes(
			1,
		);
		expect(
			hostState
				.round
				.wave,
		).toBe(
			2,
		);
		expect(
			hostState.players.map(
				(
					p,
				) =>
					p.id,
			),
		).toEqual(
			[
				hostId,
				guestId,
			],
		);
		expect(
			guestState.players.map(
				(
					p,
				) =>
					p.id,
			),
		).toEqual(
			[
				guestId,
				hostId,
			],
		);
		expect(
			guestState.players.map(
				(
					p,
				) =>
					p.materialsAvailable,
			),
		).toEqual(
			[
				2,
				1,
			],
		);
		for (const id of [
			hostId,
			guestId,
		])
			expect(
				guestState.players.find(
					(
						p,
					) =>
						p.id ===
						id,
				)
					?.position,
			).toEqual(
				hostState.players.find(
					(
						p,
					) =>
						p.id ===
						id,
				)
					?.position,
			);
	});

	it("ignores a duplicate start for a wave that already started", async () => {
		const {
			channel,
			startWave,
			finishWave:
				finish,
		} = makeConnection(
			hostId,
		);
		finishWave =
			finish;
		const message: WebsocketMessage =
			{
				type: "next-wave-started",
				gameId,
				wave: 2,
				players:
					[
						player(
							hostId,
						).toJSON(),
						player(
							guestId,
						).toJSON(),
					],
				serverStartTime: 0,
			};

		channel.deliver(
			message,
		);
		await Promise.resolve();
		channel.deliver(
			message,
		);

		expect(
			startWave,
		).toHaveBeenCalledTimes(
			1,
		);
	});
});
