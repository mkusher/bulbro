import {
	afterEach,
	expect,
	test,
} from "bun:test";
import type { Logger } from "pino";
import { WebsocketGameController } from "./game-websocket-controller";
import { registry } from "./games-registry";
import type { WebsocketConnection } from "./websocket-connection";
import { websocketConnections } from "./websocket-connections";

const hostId =
	crypto.randomUUID();
const guestId =
	crypto.randomUUID();
const lobby =
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

test("relays event batches from host to guest and guest to host", () => {
	const hostReceived: object[] =
		[];
	const guestReceived: object[] =
		[];
	websocketConnections.add(
		hostId,
		{
			sendObject:
				(
					message: object,
				) =>
					hostReceived.push(
						message,
					),
		} as unknown as WebsocketConnection,
	);
	websocketConnections.add(
		guestId,
		{
			sendObject:
				(
					message: object,
				) =>
					guestReceived.push(
						message,
					),
		} as unknown as WebsocketConnection,
	);

	const logger =
		{
			info: () => {},
			error:
				() => {},
		} as unknown as Logger;
	const controller =
		new WebsocketGameController(
			logger,
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

test("rejects unknown senders and forged roles", () => {
	const received: object[] =
		[];
	websocketConnections.add(
		guestId,
		{
			sendObject:
				(
					message: object,
				) =>
					received.push(
						message,
					),
		} as unknown as WebsocketConnection,
	);
	const logger =
		{
			info: () => {},
			error:
				() => {},
		} as unknown as Logger;
	const controller =
		new WebsocketGameController(
			logger,
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
		crypto.randomUUID(),
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
		received,
	).toEqual(
		[],
	);
});
