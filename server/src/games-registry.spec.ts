import {
	expect,
	test,
} from "bun:test";
import {
	canStartLobby,
	GamesRegistry,
} from "./games-registry";

test("keeps room membership while a known player disconnects and reconnects", () => {
	const rooms =
		new GamesRegistry();
	const lobby =
		rooms.registerLobby(
			{
				id: "host",
				username:
					"Host",
			},
		);
	rooms.addPlayer(
		lobby.id,
		{
			id: "guest",
			username:
				"Guest",
		},
	);
	expect(
		rooms.addPlayer(
			lobby.id,
			{
				id: "stranger",
				username:
					"Stranger",
			},
		),
	).toBeUndefined();
	expect(
		rooms.markConnected(
			lobby.id,
			"stranger",
		),
	).toBeUndefined();
	expect(
		rooms
			.markConnected(
				lobby.id,
				"guest",
			)
			?.players.find(
				(
					p,
				) =>
					p.id ===
					"guest",
			)
			?.status,
	).toBe(
		"connected",
	);
	expect(
		rooms
			.markDisconnected(
				lobby.id,
				"guest",
			)
			?.players.find(
				(
					p,
				) =>
					p.id ===
					"guest",
			)
			?.status,
	).toBe(
		"offline",
	);
	expect(
		rooms
			.find(
				lobby.id,
			)
			?.players.map(
				(
					p,
				) =>
					p.id,
			),
	).toEqual(
		[
			"host",
			"guest",
		],
	);
});

test("requires two distinct connected and ready members before starting", () => {
	const rooms =
		new GamesRegistry();
	const lobby =
		rooms.registerLobby(
			{
				id: "host",
				username:
					"Host",
			},
		);
	const ready =
		(
			id: string,
		) => ({
			id,
			bulbro:
				{
					id: "bulbro",
					name: "Bulbro",
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
		});
	expect(
		canStartLobby(
			lobby,
		),
	).toBe(
		false,
	);
	expect(
		rooms.markReady(
			lobby.id,
			ready(
				"stranger",
			),
		),
	).toBeUndefined();
	rooms.markConnected(
		lobby.id,
		"host",
	);
	rooms.markReady(
		lobby.id,
		ready(
			"host",
		),
	);
	expect(
		canStartLobby(
			rooms.find(
				lobby.id,
			)!,
		),
	).toBe(
		false,
	);
	rooms.addPlayer(
		lobby.id,
		{
			id: "guest",
			username:
				"Guest",
		},
	);
	rooms.markReady(
		lobby.id,
		ready(
			"guest",
		),
	);
	expect(
		canStartLobby(
			rooms.find(
				lobby.id,
			)!,
		),
	).toBe(
		false,
	);
	rooms.markConnected(
		lobby.id,
		"guest",
	);
	expect(
		canStartLobby(
			rooms.find(
				lobby.id,
			)!,
		),
	).toBe(
		true,
	);
	rooms.markReady(
		lobby.id,
		ready(
			"guest",
		),
	);
	expect(
		rooms
			.find(
				lobby.id,
			)
			?.readyPlayers.map(
				(
					player,
				) =>
					player.id,
			),
	).toEqual(
		[
			"host",
			"guest",
		],
	);
});
