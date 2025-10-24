import type { Context, Hono } from "hono";
import { cors } from "hono/cors";
import {
	joinLobby,
	markAsDisconnected,
	markPlayerReady,
} from "./game-lobby-controller";
import {
	GameState,
	hostUpdate,
	playerUpdate,
	startGame,
} from "./game-controller";
import { Player, ReadyPlayer, registry } from "./games-registry";
import { type } from "arktype";
import type { Logger } from "pino";

export const configureApi = (app: Hono, logger: Logger) => {
	app
		.use(cors())
		.post("/users", async (c: Context) => {
			const body = await c.req.json();
			const username = type("string")(body?.username);
			if (username instanceof type.errors) {
				c.status(400);
				return c.json({
					errors: username,
				});
			}
			return c.json({
				user: {
					id: crypto.randomUUID(),
					username,
					createdAt: Date.now(),
				},
			});
		})
		.post("/game-lobby", async (c: Context) => {
			const body = await c.req.json();
			const host = Player(body.host);
			if (host instanceof type.errors) {
				c.status(400);
				return c.json({
					errors: host,
				});
			}
			const lobby = registry.registerLobby(host);
			return c.json({
				lobby,
			});
		})
		.post("/game-lobby/:id/join-requests", async (c: Context) => {
			const id = c.req.param("id");
			const body = await c.req.json();
			const player = Player(body.player);
			if (player instanceof type.errors) {
				c.status(400);
				return c.json({
					errors: player,
				});
			}
			const lobby = await joinLobby(id, player);

			if (!lobby) {
				c.status(404);
				return c.json({ error: "Lobby not found" });
			}

			return c.json({
				lobby,
			});
		})
		.post("/game-lobby/:id/ready", async (c) => {
			const id = c.req.param("id");
			const body = await c.req.json();
			const player = ReadyPlayer(body.player);
			if (player instanceof type.errors) {
				c.status(400);
				return c.json({
					errors: player,
				});
			}

			const lobby = await markPlayerReady(id, player);

			if (!lobby) {
				c.status(404);
				return c.json({ error: "Lobby not found" });
			}

			logger.info(
				{ id: lobby.id, playerId: player.id },
				"Marking player as ready",
			);

			return c.json({
				lobby,
			});
		})
		.post("/game/:id/start", async (c) => {
			const id = c.req.param("id");
			const body = await c.req.json();

			const state = GameState(body.state);

			if (state instanceof type.errors) {
				logger.warn(
					{
						state,
					},
					"Invalid state passed for game start",
				);
				c.status(400);
				return c.json({ error: "Invalid state" });
			}

			await startGame(id, state);

			return c.json({
				id,
				state,
			});
		})
		.put("/game/:id/host", async (c) => {
			const id = c.req.param("id");
			const body = await c.req.json();

			const state = GameState(body.state);

			await hostUpdate(id, state);

			return c.json({
				id,
				state,
			});
		})
		.put("/game/:id/player", async (c) => {
			const id = c.req.param("id");
			const body = await c.req.json();

			const state = GameState(body.state);

			await playerUpdate(id, state);

			return c.json({
				id,
				state,
			});
		});
};
