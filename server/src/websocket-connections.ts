import type { WebsocketConnection } from "./websocket-connection";

export class WebsocketConnections {
	#byUser =
		new Map<
			string,
			WebsocketConnection
		>();
	#byConnection =
		new Map<
			WebsocketConnection,
			string
		>();

	add(
		userId: string,
		ws: WebsocketConnection,
	) {
		this.#byUser.set(
			userId,
			ws,
		);
		this.#byConnection.set(
			ws,
			userId,
		);
	}

	get(
		userId: string,
	) {
		return this.#byUser.get(
			userId,
		);
	}

	getByConnection(
		ws: WebsocketConnection,
	) {
		return this.#byConnection.get(
			ws,
		);
	}

	remove(
		userId: string,
	) {
		const ws =
			this.get(
				userId,
			);
		this.#byUser.delete(
			userId,
		);
		if (
			ws
		)
			this.#byConnection.delete(
				ws,
			);
	}

	removeConnection(
		ws: WebsocketConnection,
	) {
		const userId =
			this.#byConnection.get(
				ws,
			);
		this.#byConnection.delete(
			ws,
		);
		if (
			userId
		)
			this.#byUser.delete(
				userId,
			);
	}
}

export const websocketConnections =
	new WebsocketConnections();
