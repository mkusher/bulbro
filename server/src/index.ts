import { Hono, type Context } from "hono";
import { requestId } from "hono/request-id";
import { logger } from "./logger";
import { logger as honoLogger } from "hono/logger";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";

const app = new Hono()
	.use(requestId())
	.use(
		honoLogger((message: string, ...rest: string[]) => {
			logger.info({ emitter: "hono/logger" }, message, ...rest);
		}),
	)
	.use("/api/*", cors())
	.post("/api/users", async (c: Context) => {
		return c.json({
			user: {
				id: crypto.randomUUID(),
				createdAt: Date.now(),
			},
		});
	})
	.post("/api/game-lobby", async (c: Context) => {
		return c.json({
			lobby: {
				id: crypto.randomUUID(),
				createdAt: Date.now(),
			},
		});
	})
	.get("/*", serveStatic({ root: "./public" }));

export default app;
