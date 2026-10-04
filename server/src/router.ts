import { hasValidStartingWeapons } from "@bulbro/network-protocol";
import { type } from "arktype";
import type {
	Context,
	Hono,
} from "hono";
import { cors } from "hono/cors";
import type { Logger } from "pino";
import {
	authenticateHeader,
	issueToken,
} from "./auth";
import {
	GameState,
	startGame,
} from "./game-controller";
import {
	joinLobby,
	markPlayerReady,
} from "./game-lobby-controller";
import {
	canStartLobby,
	Player,
	ReadyPlayer,
	registry,
} from "./games-registry";
import { websocketConnections } from "./websocket-connections";

async function identity(
	c: Context,
) {
	return authenticateHeader(
		c.req.header(
			"Authorization",
		),
	);
}

export const configureApi =
	(
		app: Hono,
		logger: Logger,
	) => {
		app.use(
			cors(),
		);
		app.post(
			"/users",
			async (
				c,
			) => {
				const username =
					type(
						"string",
					)(
						(
							await c.req.json()
						)
							?.username,
					);
				if (
					username instanceof
					type.errors
				)
					return c.json(
						{
							error:
								"Invalid username",
						},
						400,
					);
				const id =
					crypto.randomUUID();
				const {
					token,
					authenticatedAt,
					expires,
				} =
					await issueToken(
						id,
					);
				return c.json(
					{
						user: {
							id,
							username,
							createdAt:
								authenticatedAt,
						},
						token,
						authenticatedAt,
						expires,
					},
				);
			},
		);
		app.post(
			"/game-lobby",
			async (
				c,
			) => {
				const user =
					await identity(
						c,
					);
				if (
					!user
				)
					return c.json(
						{
							error:
								"Unauthorized",
						},
						401,
					);
				const host =
					Player(
						(
							await c.req.json()
						)
							?.host,
					);
				if (
					host instanceof
					type.errors
				)
					return c.json(
						{
							error:
								"Invalid host",
						},
						400,
					);
				if (
					host.id !==
					user.id
				)
					return c.json(
						{
							error:
								"Forbidden",
						},
						403,
					);
				return c.json(
					{
						lobby:
							registry.registerLobby(
								host,
							),
					},
				);
			},
		);
		app.post(
			"/game-lobby/:id/join-requests",
			async (
				c,
			) => {
				const user =
					await identity(
						c,
					);
				if (
					!user
				)
					return c.json(
						{
							error:
								"Unauthorized",
						},
						401,
					);
				const player =
					Player(
						(
							await c.req.json()
						)
							?.player,
					);
				if (
					player instanceof
					type.errors
				)
					return c.json(
						{
							error:
								"Invalid player",
						},
						400,
					);
				if (
					player.id !==
					user.id
				)
					return c.json(
						{
							error:
								"Forbidden",
						},
						403,
					);
				const id =
					c.req.param(
						"id",
					);
				if (
					!registry.find(
						id,
					)
				)
					return c.json(
						{
							error:
								"Lobby not found",
						},
						404,
					);
				const lobby =
					await joinLobby(
						id,
						player,
					);
				if (
					!lobby
				)
					return c.json(
						{
							error:
								"Lobby full",
						},
						409,
					);
				return c.json(
					{
						lobby,
					},
				);
			},
		);
		app.post(
			"/game-lobby/:id/ready",
			async (
				c,
			) => {
				const user =
					await identity(
						c,
					);
				if (
					!user
				)
					return c.json(
						{
							error:
								"Unauthorized",
						},
						401,
					);
				const player =
					ReadyPlayer(
						(
							await c.req.json()
						)
							?.player,
					);
				if (
					player instanceof
					type.errors
				)
					return c.json(
						{
							error:
								"Invalid player",
						},
						400,
					);
				const lobby =
					registry.find(
						c.req.param(
							"id",
						),
					);
				if (
					!lobby
				)
					return c.json(
						{
							error:
								"Lobby not found",
						},
						404,
					);
				if (
					player.id !==
						user.id ||
					!lobby.players.some(
						(
							p,
						) =>
							p.id ===
							user.id,
					)
				)
					return c.json(
						{
							error:
								"Forbidden",
						},
						403,
					);
				if (
					!hasValidStartingWeapons(
						player.bulbro,
					)
				) {
					return c.json(
						{
							error:
								"Invalid starting weapon count",
						},
						400,
					);
				}
				const updated =
					await markPlayerReady(
						lobby.id,
						player,
					);
				logger.info(
					{
						id: lobby.id,
						playerId:
							player.id,
					},
					"Marking player as ready",
				);
				return c.json(
					{
						lobby:
							updated,
					},
				);
			},
		);
		app.post(
			"/game/:id/start",
			async (
				c,
			) => {
				const user =
					await identity(
						c,
					);
				if (
					!user
				)
					return c.json(
						{
							error:
								"Unauthorized",
						},
						401,
					);
				const lobby =
					registry.find(
						c.req.param(
							"id",
						),
					);
				if (
					!lobby
				)
					return c.json(
						{
							error:
								"Lobby not found",
						},
						404,
					);
				if (
					lobby.hostId !==
					user.id
				)
					return c.json(
						{
							error:
								"Forbidden",
						},
						403,
					);
				if (
					!canStartLobby(
						lobby,
					) ||
					!lobby.players.every(
						(
							player,
						) =>
							websocketConnections.get(
								player.id,
							),
					)
				)
					return c.json(
						{
							error:
								"Both players must be connected and ready",
						},
						409,
					);
				const state =
					GameState(
						(
							await c.req.json()
						)
							?.state,
					);
				if (
					state instanceof
					type.errors
				)
					return c.json(
						{
							error:
								"Invalid state",
						},
						400,
					);
				const players =
					type(
						{
							players:
								type(
									{
										id: "string",
									},
								).array(),
						},
					)(
						state,
					);
				if (
					players instanceof
						type.errors ||
					players
						.players
						.length !==
						2 ||
					!lobby.players.every(
						(
							member,
						) =>
							players.players.some(
								(
									player,
								) =>
									player.id ===
									member.id,
							),
					)
				)
					return c.json(
						{
							error:
								"Game state players do not match lobby",
						},
						400,
					);
				await startGame(
					lobby.id,
					state,
				);
				return c.json(
					{
						id: lobby.id,
						state,
					},
				);
			},
		);
	};
