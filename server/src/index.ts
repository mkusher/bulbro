import { Hono, type Context } from "hono";
import { requestId } from "hono/request-id";
import { logger } from "./logger";
import { logger as honoLogger } from "hono/logger";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { type } from "arktype";
import { Player, ReadyPlayer, registry } from "./games-registry";
import { websocketConnections } from "./websocket-connections";
import {
	joinLobby,
	markAsDisconnected,
	markPlayerReady,
} from "./game-lobby-controller";
import { WebsocketConnection } from "./websocket-connection";
import {
	GameState,
	hostUpdate,
	playerUpdate,
	startGame,
} from "./game-controller";
import { WebsocketGameController } from "./game-websocket-controller";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono().use(requestId()).use(
	honoLogger((message: string, ...rest: string[]) => {
		logger.info({ emitter: "hono/logger" }, message, ...rest);
	}),
);

const api = app.basePath("/api");
api
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

const wsApp = app.get(
	"/ws",
	upgradeWebSocket((c) => {
		const l = logger.child({
			requestId: c.var.requestId,
			emitter: "websocket",
		});
		l.info("Establishing new websocket connection");
		let connection: WebsocketConnection | null = null;
		const controller = new WebsocketGameController(
			l.child({
				component: "websocket-game-controller",
			}),
		);
		return {
			onOpen(event, ws) {
				l.info("New connection has been established");
				connection = new WebsocketConnection(l, ws, (message) =>
					controller.routeMessage(message),
				);
			},
			onMessage(event, ws) {
				l.info({ data: event.data }, "Message received");
				connection?.updateConnection(ws);
				connection?.onMessage(event.data as string);
			},
			async onClose(event, ws) {
				l.info("Closing connection");
				if (!connection) {
					l.warn("Connection is closed before established");
					return;
				}
				const userId = websocketConnections.getByConnection(connection);

				connection.onClose(ws);

				if (userId) {
					await markAsDisconnected(userId).catch(() => {});
				}
			},
		};
	}),
);

app.use("/tg-app", serveStatic({ root: "./public", path: "/index.html" }));

app.get(
	"*",
	serveStatic({
		root: "./public",
		onFound: (_path, c) => {
			c.header("Cache-Control", `public, immutable, max-age=31536000`);
		},
		onNotFound: (path, c) => {},
		precompressed: true,
	}),
);

export default {
	fetch: app.fetch,
	websocket,
};
