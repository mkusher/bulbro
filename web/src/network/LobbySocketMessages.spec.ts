import { wellRoundedBulbro } from "../characters-definitions";
import { smg } from "../weapons-definitions";
import {
	expect,
	test,
} from "bun:test";
import { type } from "arktype";
import {
	LobbySchema,
	parseMessage,
} from "./LobbySocketMessages";

test("preserves ready players in a late joiner's lobby snapshot", () => {
	const lobby =
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
				[
					{
						id: "host",
						bulbro:
							{
								...wellRoundedBulbro,
								weapons:
									[
										smg,
									],
							},
					},
				],
		};
	const parsed =
		LobbySchema(
			lobby,
		);
	expect(
		parsed instanceof
			type.errors,
	).toBe(
		false,
	);
	if (
		parsed instanceof
		type.errors
	)
		return;
	expect(
		parsed
			.readyPlayers[0]
			?.id,
	).toBe(
		"host",
	);
	const message =
		parseMessage(
			JSON.stringify(
				{
					type: "player-joined",
					lobby,
				},
			),
		);
	expect(
		message.type,
	).toBe(
		"player-joined",
	);
	if (
		message.type ===
		"player-joined"
	)
		expect(
			message
				.lobby
				.readyPlayers[0]
				?.id,
		).toBe(
			"host",
		);
	const snapshot =
		parseMessage(
			JSON.stringify(
				{
					type: "lobby-snapshot",
					lobby:
						{
							...lobby,
							players:
								lobby.players.map(
									(
										player,
									) => ({
										...player,
										status:
											"connected",
									}),
								),
						},
				},
			),
		);
	expect(
		snapshot.type,
	).toBe(
		"lobby-snapshot",
	);
	if (
		snapshot.type ===
		"lobby-snapshot"
	)
		expect(
			snapshot.lobby.players.every(
				(
					player,
				) =>
					player.status ===
					"connected",
			),
		).toBe(
			true,
		);
});
