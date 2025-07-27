import type { WSContext } from "hono/ws";
import type { Logger } from "pino";
import { type } from "arktype";
import { websocketConnections } from "./websocket-connections";

export const AuthMessage = type({
	type: "'auth'",
	userId: "string",
});

export const Message = AuthMessage.or(type({ type: "string" }));

export type ProcessMessage = (m: { type: string }) => void;

export class WebsocketConnection {
	#ws: WSContext;
	#logger: Logger;
	#processMessage: ProcessMessage;
	constructor(logger: Logger, ws: WSContext, processMessage: ProcessMessage) {
		this.#logger = logger;
		this.#ws = ws;
		this.#processMessage = processMessage;
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

			switch (message.type) {
				case "auth": {
					const userId = (message as { userId: string }).userId;
					websocketConnections.add(userId, this);
					this.#logger = this.#logger.child({
						userId: userId,
					});
					this.#logger.info("Websocket authentication succeeded");
					return this.sendObject({ type: "connection", connected: true });
				}
				default:
					this.#processMessage(message as { type: string });
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
