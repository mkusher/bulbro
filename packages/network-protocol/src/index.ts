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
			/** Materials left on the field in previous waves, paid out on later pickups */
			"bagMaterials?":
				"number.integer >= 0",
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
 * Live build preview while choosing upgrades or shopping. Does not set readiness.
 * `wave` is the upcoming wave; only the sender’s own player may be updated.
 */
export const ShopPlayerUpdated =
	type(
		{
			type: "'shop-player-updated'",
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

/** A player locks in their full post-shop state for the upcoming wave. */
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
		ShopPlayerUpdated,
	)
		.or(
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
	LobbyPlayerUpdated,
	LobbyWebsocketMessage,
	Player,
	PlayerConnected,
	PlayerDisconnected,
	PlayerJoined,
	PlayerReady,
	ReadyPlayer,
	Weapon,
} from "./lobby";
