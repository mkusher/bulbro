import { type } from "arktype";
import type { Logger } from "pino";
import {
	type InGameCommunicationChannel,
	type ProcessMessage,
	WebsocketMessage,
} from "../InGameCommunicationChannel";
import type { WebsocketConnection } from "./WebsocketConnection";

export class WebsocketInGameCommunicationChannel
	implements
		InGameCommunicationChannel
{
	#connection: WebsocketConnection;
	#logger: Logger;
	constructor(
		connection: WebsocketConnection,
		logger: Logger,
	) {
		this.#connection =
			connection;
		this.#logger =
			logger.child(
				{
					component:
						"in-game-communication-channel",
				},
			);
	}

	async send(
		data: object,
	) {
		this.#connection.sendObject(
			data,
		);
	}

	onMessage(
		f: ProcessMessage,
	) {
		return this.#connection.onMessage(
			(
				event,
			) => {
				const message =
					WebsocketMessage(
						JSON.parse(
							event.data,
						),
					);
				if (
					message instanceof
					type.errors
				) {
					this.#logger.warn(
						{
							err: message,
						},
						"Unknown message received",
					);
					return;
				}
				this.#logger.debug(
					{
						message,
					},
					"In game message received",
				);
				f(
					message,
				);
			},
		);
	}
}
