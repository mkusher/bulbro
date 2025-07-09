import type { WSContext } from "hono/ws";

export class WebsocketConnections {
	#byUser = new Map<string, WSContext>();
	#byConnection = new Map<WSContext, string>();

	add(userId: string, ws: WSContext) {
		this.#byUser.set(userId, ws);
		this.#byConnection.set(ws, userId);
	}

	get(userId: string) {
		return this.#byUser.get(userId);
	}

	remove(userId: string) {
		const ws = this.get(userId);
		this.#byUser.delete(userId);
		if (ws) this.#byConnection.delete(ws);
	}

	removeConnection(ws: WSContext) {
		const userId = this.#byConnection.get(ws);
		this.#byConnection.delete(ws);
		if (userId) this.#byUser.delete(userId);
	}
}

export const websocketConnections = new WebsocketConnections();
