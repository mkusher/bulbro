import { type } from "arktype";

export const Player =
	type(
		{
			id: "string",
			username:
				"string",
			"status?":
				"string",
		},
	);

export const Weapon =
	type(
		{
			id: "string",
			name: "string",
			classes:
				"string[]",
			statsBonus:
				type(
					{
						"damage?":
							"number",
						"cooldown?":
							"number",
						"range?":
							"number",
						"knockback?":
							"number",
						"critChance?":
							"number",
						"critMultiplier?":
							"number",
						"scaling?":
							{
								"meleeDamage?":
									"number",
								"rangedDamage?":
									"number",
								"elementalDamage?":
									"number",
							},
					},
				),
			shotSpeed:
				"number",
		},
	);

export const Bulbro =
	type(
		{
			id: "string",
			name: "string",
			statBonuses:
				"Record<string, string | number | boolean>",
			style:
				type(
					{
						faceType:
							"string",
						wearingItems:
							"unknown[]",
					},
				),
			weapons:
				Weapon.array(),
		},
	);

export const ReadyPlayer =
	type(
		{
			id: "string",
			bulbro:
				Bulbro,
		},
	);

export const Lobby =
	type(
		{
			id: "string",
			hostId:
				"string",
			players:
				Player.array(),
			readyPlayers:
				ReadyPlayer.array(),
			createdAt:
				"number",
		},
	);

export type Player =
	typeof Player.infer;
export type ReadyPlayer =
	typeof ReadyPlayer.infer;
export type Lobby =
	typeof Lobby.infer;

export const Connected =
	type(
		{
			type: "'connection'",
			connected:
				"boolean",
		},
	);
export const PlayerJoined =
	type(
		{
			type: "'player-joined'",
			lobby:
				Lobby,
		},
	);
export const LobbySnapshot =
	type(
		{
			type: "'lobby-snapshot'",
			lobby:
				Lobby,
		},
	);
export const PlayerReady =
	type(
		{
			type: "'player-ready'",
			readyPlayer:
				ReadyPlayer,
		},
	);
export const PlayerDisconnected =
	type(
		{
			type: "'player-disconnected'",
			player:
				"object",
		},
	);
export const PlayerConnected =
	type(
		{
			type: "'player-connected'",
			player:
				Player,
		},
	);
export const GameStarted =
	type(
		{
			type: "'game-started'",
			initialState:
				"object",
		},
	);
export const LobbyWebsocketMessage =
	Connected.or(
		PlayerJoined,
	)
		.or(
			LobbySnapshot,
		)
		.or(
			PlayerReady,
		)
		.or(
			PlayerDisconnected,
		)
		.or(
			PlayerConnected,
		)
		.or(
			GameStarted,
		);

export type LobbyWebsocketMessage =
	typeof LobbyWebsocketMessage.infer;
