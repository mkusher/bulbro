import {
	expect,
	test,
} from "bun:test";
import {
	joinLobby,
	markAsConnected,
} from "./game-lobby-controller";
import { registry } from "./games-registry";
import type { WebsocketConnection } from "./websocket-connection";
import { websocketConnections } from "./websocket-connections";

test("a connected guest joins as connected and the host receives that state", async () => {
	const hostId =
		crypto.randomUUID();
	const guestId =
		crypto.randomUUID();
	const lobby =
		registry.registerLobby(
			{
				id: hostId,
				username:
					"Host",
			},
		);
	const messages: object[] =
		[];
	const socket =
		(
			received: object[],
		) =>
			({
				send: (
					message: string,
				) =>
					received.push(
						JSON.parse(
							message,
						),
					),
			}) as unknown as WebsocketConnection;
	websocketConnections.add(
		hostId,
		socket(
			messages,
		),
	);
	websocketConnections.add(
		guestId,
		socket(
			[],
		),
	);
	try {
		const joined =
			await joinLobby(
				lobby.id,
				{
					id: guestId,
					username:
						"Guest",
				},
			);
		expect(
			joined?.players.find(
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
			messages,
		).toContainEqual(
			{
				type: "player-joined",
				lobby:
					joined,
			},
		);
	} finally {
		websocketConnections.remove(
			hostId,
		);
		websocketConnections.remove(
			guestId,
		);
	}
});

test("authentication sends the connecting player a current lobby snapshot", async () => {
	const hostId =
		crypto.randomUUID();
	const guestId =
		crypto.randomUUID();
	const lobby =
		registry.registerLobby(
			{
				id: hostId,
				username:
					"Host",
			},
		);
	registry.addPlayer(
		lobby.id,
		{
			id: guestId,
			username:
				"Guest",
		},
	);
	registry.markConnected(
		lobby.id,
		hostId,
	);
	const messages: object[] =
		[];
	websocketConnections.add(
		guestId,
		{
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
	try {
		await markAsConnected(
			guestId,
		);
		expect(
			messages,
		).toContainEqual(
			{
				type: "lobby-snapshot",
				lobby:
					registry.find(
						lobby.id,
					),
			},
		);
		expect(
			registry
				.find(
					lobby.id,
				)
				?.players.every(
					(
						player,
					) =>
						player.status ===
						"connected",
				),
		).toBe(
			true,
		);
	} finally {
		websocketConnections.remove(
			guestId,
		);
	}
});
