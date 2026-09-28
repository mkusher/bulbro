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
