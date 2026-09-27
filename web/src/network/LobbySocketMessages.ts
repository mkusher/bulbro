import { type } from "arktype";
export const PlayerAttendee =
	type(
		{
			id: "string",
			username:
				"string",
			"status?":
				"string",
		},
	);
export const ReadyPlayerAttendee =
	type(
		{
			id: "string",
			bulbro:
				"object",
		},
	);
export const LobbySchema =
	type(
		{
			id: "string",
			createdAt:
				"number",
			hostId:
				"string",
			players:
				PlayerAttendee.array(),
			readyPlayers:
				ReadyPlayerAttendee.array(),
		},
	);

export type PlayerAttendee =
	typeof PlayerAttendee.infer;
export type ReadyPlayerAttendee =
	typeof ReadyPlayerAttendee.infer;
export type Lobby =
	typeof LobbySchema.infer;

export function parseMessage(
	message: string,
) {
	const data =
		WebsocketMessage(
			JSON.parse(
				message,
			),
		);

	if (
		data instanceof
		type.errors
	) {
		throw data;
	}

	return data;
}

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
				LobbySchema,
		},
	);
export const PlayerReady =
	type(
		{
			type: "'player-ready'",
			readyPlayer:
				ReadyPlayerAttendee,
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
				PlayerAttendee,
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
export const WebsocketMessage =
	Connected.or(
		PlayerJoined,
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
