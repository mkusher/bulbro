import { Hono, type Context } from "hono";
import { requestId } from "hono/request-id";
import { logger as baseLogger } from "./logger";
import { logger as honoLogger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { websocketConnections } from "./websocket-connections";
import { markAsDisconnected } from "./game-lobby-controller";
import { WebsocketConnection } from "./websocket-connection";
import { WebsocketGameController } from "./game-websocket-controller";
import { configureApi } from "./router";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const httpServerLogger = baseLogger.child({ component: "http-server" });
const logger = httpServerLogger;

const app = new Hono().use(requestId()).use(
	honoLogger((message: string, ...rest: string[]) => {
		logger.info({ emitter: "hono/logger" }, message, ...rest);
	}),
);

const api = app.basePath("/api");
configureApi(api, logger);

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
			return c.header("Cache-Control", `public, immutable, max-age=31536000`);
		},
		onNotFound: (path, c) => {
			httpServerLogger.info("Not found");
			c.redirect("/");
		},
		precompressed: true,
	}),
);

export default {
	fetch: app.fetch,
	websocket,
};
