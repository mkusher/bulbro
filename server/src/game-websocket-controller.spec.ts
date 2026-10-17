import {
	expect,
	test,
} from "bun:test";
import type { Logger } from "pino";
import { WebsocketGameController } from "./game-websocket-controller";
import { GamesRegistry } from "./games-registry";

const logger =
	{
		info() {},
		error() {},
	} as unknown as Logger;

function createRelay() {
	const rooms =
		new GamesRegistry();
	const hostId =
		"host";
	const guestId =
		"guest";
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

	const endpoints =
		new Map<
			string,
			{
				sendObject(
					message: object,
				): void;
			}
		>();
	const controller =
		new WebsocketGameController(
			logger,
			{
				rooms,
				connections:
					endpoints,
			},
		);

	function connect(
		userId: string,
	) {
		const inbox: object[] =
			[];
		endpoints.set(
			userId,
			{
				sendObject(
					message,
				) {
					// Use the same JSON boundary as a WebSocket connection.
					inbox.push(
						JSON.parse(
							JSON.stringify(
								message,
							),
						),
					);
				},
			},
		);
		return inbox;
	}

	return {
		rooms,
		lobby,
		hostId,
		guestId,
		controller,
		connect,
		endpoints,
	};
}

test("relays event batches between isolated host and guest endpoints", () => {
	const {
		lobby,
		hostId,
		guestId,
		controller,
		connect,
	} =
		createRelay();
	const hostReceived =
		connect(
			hostId,
		);
	const guestReceived =
		connect(
			guestId,
		);
	const hostMessage =
		{
			type: "game-state-updated-by-host",
			gameId:
				lobby.id,
			version: 1,
			events:
				[
					{
						type: "tick",
						occurredAt: 12,
						deltaTime: 16,
					},
				],
			sentAt: 100,
		};
	const guestMessage =
		{
			type: "game-state-updated-by-guest",
			gameId:
				lobby.id,
			version: 2,
			events:
				[
					{
						type: "bulbroMoved",
						occurredAt: 20,
						deltaTime: 16,
					},
				],
			sentAt: 110,
		};

	controller.routeMessage(
		hostId,
		hostMessage,
	);
	controller.routeMessage(
		guestId,
		guestMessage,
	);

	expect(
		guestReceived,
	).toEqual(
		[
			hostMessage,
		],
	);
	expect(
		hostReceived,
	).toEqual(
		[
			guestMessage,
		],
	);
});

test("rejects unknown senders, forged roles, and forged positions", () => {
	const {
		lobby,
		hostId,
		guestId,
		controller,
		connect,
	} =
		createRelay();
	const hostReceived =
		connect(
			hostId,
		);
	const guestReceived =
		connect(
			guestId,
		);
	const update =
		{
			type: "game-state-updated-by-host",
			gameId:
				lobby.id,
			version: 1,
			events:
				[],
			sentAt: 100,
		};

	controller.routeMessage(
		"stranger",
		update,
	);
	controller.routeMessage(
		guestId,
		update,
	);
	controller.routeMessage(
		hostId,
		{
			type: "game-state-position-updated",
			gameId:
				lobby.id,
			playerId:
				guestId,
			position:
				{
					x: 0,
					y: 0,
				},
			direction:
				{
					x: 0,
					y: 0,
				},
			version: 1,
			sentAt: 100,
		},
	);

	expect(
		hostReceived,
	).toEqual(
		[],
	);
	expect(
		guestReceived,
	).toEqual(
		[],
	);
});

test("relays only within the named room and skips disconnected endpoints", () => {
	const {
		rooms,
		lobby,
		hostId,
		guestId,
		controller,
		connect,
		endpoints,
	} =
		createRelay();
	const guestReceived =
		connect(
			guestId,
		);
	const otherHost =
		"other-host";
	const otherGuest =
		"other-guest";
	const otherLobby =
		rooms.registerLobby(
			{
				id: otherHost,
				username:
					"Other host",
			},
		);
	rooms.addPlayer(
		otherLobby.id,
		{
			id: otherGuest,
			username:
				"Other guest",
		},
	);
	const otherReceived =
		connect(
			otherGuest,
		);
	const update =
		{
			type: "game-state-updated-by-host",
			gameId:
				lobby.id,
			version: 1,
			events:
				[],
			sentAt: 100,
		};

	controller.routeMessage(
		hostId,
		update,
	);
	controller.routeMessage(
		otherHost,
		update,
	);
	expect(
		guestReceived,
	).toEqual(
		[
			update,
		],
	);
	expect(
		otherReceived,
	).toEqual(
		[],
	);

	endpoints.delete(
		guestId,
	);
	controller.routeMessage(
		hostId,
		{
			...update,
			version: 2,
		},
	);
	expect(
		guestReceived,
	).toEqual(
		[
			update,
		],
	);
});

test("shares lobby choices without readying, retaining them for late joiners", () => {
	const {
		controller,
		rooms,
		lobby,
		hostId,
		guestId,
		connect,
	} =
		createRelay();
	const received =
		connect(
			guestId,
		);
	const player =
		{
			id: hostId,
			bulbro:
				{
					id: "well-rounded",
					name: "Well rounded",
					statBonuses:
						{},
					style:
						{
							faceType:
								"normal",
							wearingItems:
								[],
						},
					weapons:
						[],
				},
		};
	const message =
		{
			type: "lobby-player-updated",
			gameId:
				lobby.id,
			player,
		};
	controller.routeMessage(
		hostId,
		message,
	);
	expect(
		received,
	).toEqual(
		[
			message,
		],
	);
	expect(
		rooms.find(
			lobby.id,
		)
			?.loadouts,
	).toEqual(
		[
			player,
		],
	);
	expect(
		rooms.find(
			lobby.id,
		)
			?.readyPlayers,
	).toEqual(
		[],
	);
	controller.routeMessage(
		guestId,
		message,
	);
	controller.routeMessage(
		"outsider",
		{
			...message,
			player:
				{
					...player,
					id: "outsider",
				},
		},
	);
	expect(
		received,
	).toHaveLength(
		1,
	);
	rooms.markReady(
		lobby.id,
		player,
	);
	controller.routeMessage(
		hostId,
		{
			...message,
			player:
				{
					...player,
					bulbro:
						{
							...player.bulbro,
							id: "changed",
						},
				},
		},
	);
	expect(
		received,
	).toHaveLength(
		1,
	);
	rooms.markGameStarted(
		lobby.id,
	);
	controller.routeMessage(
		guestId,
		{
			...message,
			player:
				{
					...player,
					id: guestId,
				},
		},
	);
	expect(
		rooms.find(
			lobby.id,
		)
			?.loadouts,
	).toEqual(
		[
			player,
		],
	);
});

test("shares validated shop snapshots without changing readiness and rejects stale or forged updates", () => {
	const {
		controller,
		rooms,
		lobby,
		hostId,
		guestId,
		connect,
	} =
		createRelay();
	const received =
		connect(
			guestId,
		);
	const player =
		{
			id: hostId,
			characterId:
				"well-rounded",
			level: 2,
			totalExperience: 10,
			healthPoints: 10,
			materialsAvailable: 35,
			statSources:
				[
					{
						id: "level-up-2",
						kind: "upgrade",
						bonuses:
							{
								damage: 5,
							},
					},
				],
			items:
				[
					"coffee",
				],
			weapons:
				[],
		};
	const message =
		{
			type: "shop-player-updated",
			gameId:
				lobby.id,
			wave: 2,
			playerId:
				hostId,
			player,
			sentAt: 0,
		};
	controller.routeMessage(
		hostId,
		message,
	);
	expect(
		received,
	).toHaveLength(
		0,
	);
	rooms.markGameStarted(
		lobby.id,
	);
	controller.routeMessage(
		hostId,
		message,
	);
	expect(
		received,
	).toEqual(
		[
			{
				...message,
				sentAt:
					expect.any(
						Number,
					),
			},
		],
	);
	expect(
		rooms.nextWaveToStart(
			lobby.id,
		),
	).toBeUndefined();
	expect(
		rooms
			.shopPlayers(
				lobby.id,
			)
			?.players.get(
				hostId,
			),
	).toEqual(
		player,
	);
	for (const invalid of [
		{
			...message,
			wave: 1,
		},
		{
			...message,
			wave: 3,
		},
		{
			...message,
			playerId:
				guestId,
		},
		{
			...message,
			player:
				{
					...player,
					id: guestId,
				},
		},
		{
			...message,
			player:
				{
					...player,
					items:
						[
							42,
						],
				},
		},
	])
		controller.routeMessage(
			hostId,
			invalid,
		);
	controller.routeMessage(
		"outsider",
		{
			...message,
			playerId:
				"outsider",
			player:
				{
					...player,
					id: "outsider",
				},
		},
	);
	expect(
		received,
	).toHaveLength(
		1,
	);
	rooms.markReadyForNextWave(
		lobby.id,
		2,
		hostId,
		player,
	);
	controller.routeMessage(
		hostId,
		{
			...message,
			player:
				{
					...player,
					materialsAvailable: 0,
				},
		},
	);
	expect(
		received,
	).toHaveLength(
		1,
	);
	rooms.markNotReadyForNextWave(
		lobby.id,
		2,
		hostId,
	);
	controller.routeMessage(
		hostId,
		{
			...message,
			player:
				{
					...player,
					materialsAvailable: 0,
				},
		},
	);
	expect(
		received,
	).toHaveLength(
		2,
	);
	rooms.markNextWaveStarted(
		lobby.id,
		2,
	);
	expect(
		rooms.shopPlayers(
			lobby.id,
		),
	).toBeUndefined();
	controller.routeMessage(
		hostId,
		message,
	);
	expect(
		received,
	).toHaveLength(
		2,
	);
});
