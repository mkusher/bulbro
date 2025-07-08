import { type } from "arktype";
import type { WSContext } from "hono/ws";
import type { Logger } from "pino";
import { websocketConnections } from "./websocket-connections";

export const Message = type({
	type: "'auth'",
	userId: "string",
});

export function onMessage(logger: Logger, ws: WSContext, data: string) {
	try {
		const message = Message(JSON.parse(data));
		if (message instanceof type.errors) {
			logger.warn(
				{
					err: message,
				},
				"Invalid message format received",
			);
			return ws.send(JSON.stringify({ error: "Invalid message" }));
		}

		if (message.type === "auth") {
			websocketConnections.add(message.userId, ws);
			return ws.send(JSON.stringify({ connected: true }));
		}
	} catch (err) {
		logger.warn({ err }, "Error processing websocket message");
		return ws.send(JSON.stringify({ error: "Invalid message" }));
	}
}
