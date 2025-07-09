import { Hono, type Context } from "hono";
import { requestId } from "hono/request-id";
import { logger } from "./logger";
import { logger as honoLogger } from "hono/logger";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { type } from "arktype";
import { Player, registry } from "./games-registry";
import { websocketConnections } from "./websocket-connections";
import { onMessage } from "./websocket-controller";

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
		const lobby = registry.addPlayer(id, player);

		if (!lobby) {
			c.status(404);
			return c.json({ error: "Lobby not found" });
		}

		const hostSocket = websocketConnections.get(lobby.hostId);
		if (hostSocket) {
			hostSocket.send(
				JSON.stringify({
					type: "lobby-update",
					lobby,
				}),
			);
		}
		return c.json({
			lobby,
		});
	});

const wsApp = app.get(
	"/ws",
	upgradeWebSocket((c) => {
		const authHeader = c.req.header("Authorization") ?? "";
		const userId = authHeader.split(" ").pop();
		const l = logger.child({
			requestId: c.var.requestId,
			userId,
			emitter: "websocket",
		});
		l.info("Establishing new websocket connection");
		if (!userId) {
			c.status(401);
			c.json({ error: { message: "Auth error" } });
		}
		return {
			onOpen(event, ws) {
				l.info("New connection has been established");
			},
			onMessage(event, ws) {
				l.info({ data: event.data }, "Message received");
				onMessage(l, ws, event.data as string);
			},
			onClose() {
				l.info("Connection has been closed");
				if (userId) {
					websocketConnections.remove(userId);
				}
			},
		};
	}),
);

app.get("*", serveStatic({ root: "./public" }));
app.get("*", serveStatic({ root: "./public", path: "/" }));

export default {
	fetch: app.fetch,
	websocket,
};
