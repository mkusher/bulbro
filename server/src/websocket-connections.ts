import type { WSContext } from "hono/ws";

export class WebsocketConnections {
	#byUser = new Map<string, WSContext>();
	#byConnection = new Map<WSContext, string>();

	add(id: string, ws: WSContext) {
		this.#byUser.set(id, ws);
		this.#byConnection.set(ws, id);
	}

	get(id: string) {
		return this.#byUser.get(id);
	}

	remove(id: string) {
		const ws = this.get(id);
		this.#byUser.delete(id);
		if (ws) this.#byConnection.delete(ws);
	}

	removeConnection(ws: WSContext) {
		const userId = this.#byConnection.get(ws);
		this.#byConnection.delete(ws);
		if (userId) this.#byUser.delete(userId);
	}
}

export const websocketConnections = new WebsocketConnections();
