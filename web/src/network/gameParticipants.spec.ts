import {
	expect,
	test,
} from "bun:test";
import type { Lobby } from "./LobbySocketMessages";
import {
	orderPlayersLocalFirst,
	remotePlayerIdFor,
} from "./gameParticipants";

const lobby: Lobby =
	{
		id: "game",
		hostId:
			"host",
		createdAt: 1,
		players:
			[
				{
					id: "host",
					username:
						"Host",
				},
				{
					id: "guest",
					username:
						"Guest",
				},
			],
		readyPlayers:
			[],
	};

test("selects the other player for both host and guest", () => {
	expect(
		remotePlayerIdFor(
			lobby,
			"host",
		),
	).toBe(
		"guest",
	);
	expect(
		remotePlayerIdFor(
			lobby,
			"guest",
		),
	).toBe(
		"host",
	);
});

test("orders the host before a guest who readied first", () => {
	const guest =
		{
			id: "guest",
		};
	const host =
		{
			id: "host",
		};
	expect(
		orderPlayersLocalFirst(
			[
				guest,
				host,
			],
			"host",
		),
	).toEqual(
		[
			host,
			guest,
		],
	);
	expect(
		() =>
			orderPlayersLocalFirst(
				[
					guest,
				],
				"host",
			),
	).toThrow();
});

test("rejects incomplete and unknown membership", () => {
	expect(
		() =>
			remotePlayerIdFor(
				{
					...lobby,
					players:
						lobby.players.slice(
							0,
							1,
						),
				},
				"host",
			),
	).toThrow();
	expect(
		() =>
			remotePlayerIdFor(
				lobby,
				"stranger",
			),
	).toThrow();
});
