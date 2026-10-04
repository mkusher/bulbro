import { type } from "arktype";

export {
	baseWeaponStats,
	hasValidStartingWeapons,
} from "./weapon-limits";

const Point =
	type(
		{
			x: "number",
			y: "number",
		},
	);

/**
 * Serialized player state shared between waves. Only the fields every client
 * relies on are validated; the rest of the state is passed through as is.
 */
const SerializedPlayer =
	type(
		{
			id: "string",
			characterId:
				"string",
		},
	);

export const HostStateUpdate =
	type(
		{
			type: "'game-state-updated-by-host'",
			gameId:
				"string",
			version:
				"number",
			events:
				"object[]",
			sentAt:
				"number",
		},
	);

export const PlayerStateUpdate =
	type(
		{
			type: "'game-state-updated-by-guest'",
			gameId:
				"string",
			version:
				"number",
			events:
				"object[]",
			sentAt:
				"number",
		},
	);

export const PlayerPositionUpdated =
	type(
		{
			type: "'game-state-position-updated'",
			gameId:
				"string",
			playerId:
				"string",
			position:
				Point,
			direction:
				Point,
			version:
				"number",
			sentAt:
				"number",
		},
	);

/**
 * A player finished shopping. Sent by the client to the server and relayed to
 * the other players. `wave` is the wave that should start next and `player`
 * is the serialized player state after shopping.
 */
export const NextWavePlayerReady =
	type(
		{
			type: "'next-wave-player-ready'",
			gameId:
				"string",
			wave: "number.integer",
			playerId:
				"string",
			player:
				SerializedPlayer,
			sentAt:
				"number",
		},
	);

/**
 * A player withdrew readiness to keep shopping. Sent by the client to the
 * server and relayed to the other players.
 */
export const NextWavePlayerNotReady =
	type(
		{
			type: "'next-wave-player-not-ready'",
			gameId:
				"string",
			wave: "number.integer",
			playerId:
				"string",
			sentAt:
				"number",
		},
	);

/**
 * Sent by the server to every player once all players are ready and connected.
 * `players` contains every player's state, host first.
 */
export const NextWaveStarted =
	type(
		{
			type: "'next-wave-started'",
			gameId:
				"string",
			wave: "number.integer",
			players:
				SerializedPlayer.array(),
			serverStartTime:
				"number",
		},
	);

export const WebsocketMessage =
	HostStateUpdate.or(
		PlayerStateUpdate,
	)
		.or(
			PlayerPositionUpdated,
		)
		.or(
			NextWavePlayerReady,
		)
		.or(
			NextWavePlayerNotReady,
		)
		.or(
			NextWaveStarted,
		);

export type WebsocketMessage =
	typeof WebsocketMessage.infer;

export {
	Bulbro,
	Connected,
	GameStarted,
	Lobby,
	LobbySnapshot,
	LobbyWebsocketMessage,
	Player,
	PlayerConnected,
	PlayerDisconnected,
	PlayerJoined,
	PlayerReady,
	ReadyPlayer,
	Weapon,
} from "./lobby";
