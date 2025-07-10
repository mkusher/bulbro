import type { WSContext } from "hono/ws";
import type { Logger } from "pino";
import { type } from "arktype";
import { websocketConnections } from "./websocket-connections";

export const Message = type({
	type: "'auth'",
	userId: "string",
});

export class WebsocketConnection {
	#ws: WSContext;
	#logger: Logger;
	constructor(logger: Logger, ws: WSContext) {
		this.#logger = logger;
		this.#ws = ws;
	}

	updateConnection(ws: WSContext) {
		this.#ws = ws;
	}

	sendObject(message: object) {
		this.send(JSON.stringify(message));
	}

	send(message: string) {
		this.#logger.info("Sending message to connection");
		this.#ws.send(message);
	}

	onMessage(data: string) {
		try {
			const message = Message(JSON.parse(data));
			if (message instanceof type.errors) {
				this.#logger.warn(
					{
						err: message,
					},
					"Invalid message format received",
				);
				return this.sendObject({ error: "Invalid message" });
			}

			if (message.type === "auth") {
				websocketConnections.add(message.userId, this);
				this.#logger = this.#logger.child({
					userId: message.userId,
				});
				this.#logger.info("Websocket authentication succeeded");
				return this.sendObject({ connected: true });
			}
		} catch (err) {
			this.#logger.warn({ err }, "Error processing websocket message");
			return this.sendObject({ error: "Internal error" });
		}
	}
	onClose(ws: WSContext) {
		this.updateConnection(ws);
		websocketConnections.removeConnection(this);
		this.#logger.info("Connection is closed");
	}
}
