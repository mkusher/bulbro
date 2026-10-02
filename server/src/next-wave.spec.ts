import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import type { Logger } from "pino";
import { startGame } from "./game-controller";
import { markAsConnected } from "./game-lobby-controller";
import { WebsocketGameController } from "./game-websocket-controller";
import {
	type Lobby,
	registry,
} from "./games-registry";
import type { WebsocketConnection } from "./websocket-connection";
import { websocketConnections } from "./websocket-connections";

const relayDependencies =
	{
		rooms:
			registry,
		connections:
			websocketConnections,
	};

const logger =
	{
		info: () => {},
		error:
			() => {},
	} as unknown as Logger;

let hostId: string;
let guestId: string;
let lobby: Lobby;
type ReceivedMessage =
	{
		type?: string;
		[
			key: string
		]: unknown;
	};
let received: Record<
	string,
	ReceivedMessage[]
>;

function connect(
	playerId: string,
) {
	const messages: ReceivedMessage[] =
		[];
	received[
		playerId
	] =
		messages;
	websocketConnections.add(
		playerId,
		{
			sendObject:
				(
					message: ReceivedMessage,
				) =>
					messages.push(
						message,
					),
			send: (
				message: string,
			) =>
				messages.push(
					JSON.parse(
						message,
					),
				),
		} as unknown as WebsocketConnection,
	);
	registry.markConnected(
		lobby.id,
		playerId,
	);
}

function ready(
	playerId: string,
	wave = 2,
	player: object = {
		id: playerId,
		materialsAvailable: 3,
	},
) {
	new WebsocketGameController(
		logger,
		relayDependencies,
	).routeMessage(
		playerId,
		{
			type: "next-wave-player-ready",
			gameId:
				lobby.id,
			wave,
			playerId,
			player,
			sentAt: 1,
		},
	);
}

function notReady(
	playerId: string,
	wave = 2,
) {
	new WebsocketGameController(
		logger,
		relayDependencies,
	).routeMessage(
		playerId,
		{
			type: "next-wave-player-not-ready",
			gameId:
				lobby.id,
			wave,
			playerId,
			sentAt: 1,
		},
	);
}

function messagesOf(
	playerId: string,
	type: string,
) {
	return (
		received[
			playerId
		] ??
		[]
	).filter(
		(
			message,
		) =>
			message.type ===
			type,
	);
}

describe("next wave readiness", () => {
	beforeEach(
		async () => {
			hostId =
				crypto.randomUUID();
			guestId =
				crypto.randomUUID();
			received =
				{};
			lobby =
				registry.registerLobby(
					{
						id: hostId,
						username:
							"host",
					},
				);
			registry.addPlayer(
				lobby.id,
				{
					id: guestId,
					username:
						"guest",
				},
			);
			connect(
				guestId,
			);
			connect(
				hostId,
			);
			await startGame(
				lobby.id,
				{},
			);
		},
	);

	afterEach(
		() => {
			websocketConnections.remove(
				hostId,
			);
			websocketConnections.remove(
				guestId,
			);
		},
	);

	test("relays readiness to the other player without starting the wave", () => {
		ready(
			guestId,
		);

		expect(
			messagesOf(
				hostId,
				"next-wave-player-ready",
			),
		).toEqual(
			[
				expect.objectContaining(
					{
						gameId:
							lobby.id,
						wave: 2,
						playerId:
							guestId,
					},
				),
			],
		);
		expect(
			messagesOf(
				guestId,
				"next-wave-player-ready",
			),
		).toEqual(
			[],
		);
		expect(
			messagesOf(
				hostId,
				"next-wave-started",
			),
		).toEqual(
			[],
		);
	});

	test("starts the wave for everyone with host-first player states", () => {
		ready(
			guestId,
		);
		ready(
			hostId,
		);

		for (const playerId of [
			hostId,
			guestId,
		]) {
			const started =
				messagesOf(
					playerId,
					"next-wave-started",
				);
			expect(
				started,
			).toHaveLength(
				1,
			);
			expect(
				started[0],
			).toMatchObject(
				{
					gameId:
						lobby.id,
					wave: 2,
					players:
						[
							{
								id: hostId,
							},
							{
								id: guestId,
							},
						],
				},
			);
		}
	});

	test("uses the latest submitted player state", () => {
		ready(
			hostId,
			2,
			{
				id: hostId,
				materialsAvailable: 10,
			},
		);
		ready(
			hostId,
			2,
			{
				id: hostId,
				materialsAvailable: 0,
			},
		);
		ready(
			guestId,
		);

		expect(
			messagesOf(
				guestId,
				"next-wave-started",
			)[0]
				?.players,
		).toContainEqual(
			{
				id: hostId,
				materialsAvailable: 0,
			},
		);
	});

	test("rejects stale or future waves and foreign player states", () => {
		ready(
			hostId,
			1,
		);
		ready(
			hostId,
			3,
		);
		ready(
			hostId,
			2,
			{
				id: guestId,
			},
		);

		expect(
			messagesOf(
				guestId,
				"next-wave-player-ready",
			),
		).toEqual(
			[],
		);
	});

	test("ignores clients announcing a wave start", () => {
		new WebsocketGameController(
			logger,
			relayDependencies,
		).routeMessage(
			hostId,
			{
				type: "next-wave-started",
				gameId:
					lobby.id,
				wave: 2,
				players:
					[],
				serverStartTime: 1,
			},
		);

		expect(
			messagesOf(
				guestId,
				"next-wave-started",
			),
		).toEqual(
			[],
		);
	});

	test("waits for a disconnected player and starts after reconnect", async () => {
		registry.markDisconnected(
			lobby.id,
			guestId,
		);
		ready(
			hostId,
		);
		ready(
			guestId,
		);
		expect(
			messagesOf(
				hostId,
				"next-wave-started",
			),
		).toEqual(
			[],
		);

		await markAsConnected(
			guestId,
		);

		expect(
			messagesOf(
				hostId,
				"next-wave-started",
			),
		).toHaveLength(
			1,
		);
	});

	test("starts every following wave once", () => {
		ready(
			hostId,
		);
		ready(
			guestId,
		);
		ready(
			hostId,
			3,
		);
		ready(
			guestId,
			3,
		);
		ready(
			guestId,
			3,
		);

		expect(
			messagesOf(
				hostId,
				"next-wave-started",
			).map(
				(
					message,
				) =>
					message.wave,
			),
		).toEqual(
			[
				2,
				3,
			],
		);
	});

	test("withdrawn readiness is relayed and blocks the wave until ready again", () => {
		ready(
			hostId,
		);
		notReady(
			hostId,
		);
		ready(
			guestId,
		);

		expect(
			messagesOf(
				guestId,
				"next-wave-player-not-ready",
			),
		).toEqual(
			[
				expect.objectContaining(
					{
						gameId:
							lobby.id,
						wave: 2,
						playerId:
							hostId,
					},
				),
			],
		);
		expect(
			messagesOf(
				hostId,
				"next-wave-started",
			),
		).toEqual(
			[],
		);

		ready(
			hostId,
		);

		expect(
			messagesOf(
				hostId,
				"next-wave-started",
			),
		).toHaveLength(
			1,
		);
	});

	test("ignores withdrawn readiness after the wave started", () => {
		ready(
			hostId,
		);
		ready(
			guestId,
		);
		notReady(
			hostId,
		);

		expect(
			messagesOf(
				guestId,
				"next-wave-player-not-ready",
			),
		).toEqual(
			[],
		);
	});
});
