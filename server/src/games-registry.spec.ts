import {
	expect,
	test,
} from "bun:test";
import { GamesRegistry } from "./games-registry";

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
