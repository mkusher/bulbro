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

const StatBonuses =
	type(
		"Record<string, number>",
	);

/** Where a Bulbro's stat points come from, e.g. its character or an owned item. */
const StatSource =
	type(
		{
			id: "string",
			kind: "'character' | 'harvestingGrowth' | 'upgrade' | 'item' | 'level'",
			bonuses:
				StatBonuses,
		},
	);

const SerializedWeapon =
	type(
		{
			id: "string",
			type: "string",
			"tier?":
				"1 | 2 | 3 | 4",
			statsBonus:
				"object",
			shotSpeed:
				"number",
		},
	);

/**
 * Serialized player state shared between waves. Fields that define what a
 * Bulbro is (stats, inventory, weapons) are validated so every client can
 * show remote players with their real stats and owned items; the rest of the
 * state is passed through as is.
 */
export const SerializedPlayer =
	type(
		{
			id: "string",
			characterId:
				"string",
			level:
				"number.integer >= 0",
			totalExperience:
				"number",
			materialsAvailable:
				"number",
			healthPoints:
				"number",
			/** Every stat source, item ones included; receivers recompute stats from them. */
			statSources:
				StatSource.array(),
			/** Owned item ids in acquisition order; duplicates are separate copies. */
			items:
				"string[]",
			weapons:
				SerializedWeapon.array(),
		},
	);

export type SerializedPlayer =
	typeof SerializedPlayer.infer;

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
