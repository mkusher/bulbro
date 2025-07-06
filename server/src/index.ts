import { Hono, type Context } from "hono";
import { requestId } from "hono/request-id";
import { logger } from "./logger";
import { logger as honoLogger } from "hono/logger";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";

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
		return c.json({
			user: {
				id: crypto.randomUUID(),
				createdAt: Date.now(),
			},
		});
	})
	.post("/game-lobby", async (c: Context) => {
		return c.json({
			lobby: {
				id: crypto.randomUUID(),
				createdAt: Date.now(),
			},
		});
	})
	.post("/game-lobby/:id/join-requests", async (c: Context) => {
		return c.json({
			lobby: {
				id: crypto.randomUUID(),
				createdAt: Date.now(),
			},
		});
	});

const wsApp = app.get(
	"/ws",
	upgradeWebSocket((c) => {
		const l = logger.child({
			requestId: c.var.requestId,
			emitter: "websocket",
		});
		l.info("Connection has been established");
		return {
			onMessage(event, ws) {
				l.info({ data: event.data }, "Message received");
				ws.send(JSON.stringify({ ok: true }));
			},
			onClose() {
				l.info("Connection has been closed");
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
