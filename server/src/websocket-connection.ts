import { type } from "arktype";
import type { WSContext } from "hono/ws";
import type { Logger } from "pino";
import { verifyToken } from "./auth";
import { markAsConnected } from "./game-lobby-controller";
import { websocketConnections } from "./websocket-connections";

export const AuthMessage =
	type(
		{
			type: "'auth'",
			token:
				"string",
		},
	);

export const Message =
	AuthMessage.or(
		type(
			{
				type: "string",
			},
		),
	);

export type ProcessMessage =
	(m: {
		type: string;
	}) => void;

export class WebsocketConnection {
	#ws: WSContext;
	#logger: Logger;
	#processMessage: (
		userId: string,
		m: {
			type: string;
		},
	) => void;
	#expires = 0;
	#expirationTimer?: ReturnType<
		typeof setTimeout
	>;
	constructor(
		logger: Logger,
		ws: WSContext,
		processMessage: (
			userId: string,
			m: {
				type: string;
			},
		) => void,
	) {
		this.#logger =
			logger;
		this.#ws =
			ws;
		this.#processMessage =
			processMessage;
	}

	updateConnection(
		ws: WSContext,
	) {
		this.#ws =
			ws;
	}

	sendObject(
		message: object,
	) {
		this.send(
			JSON.stringify(
				message,
			),
		);
	}

	send(
		message: string,
	) {
		this.#logger.info(
			"Sending message to connection",
		);
		this.#ws.send(
			message,
		);
	}

	async onMessage(
		data: string,
	) {
		try {
			const message =
				Message(
					JSON.parse(
						data,
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
					"Invalid message format received",
				);
				return this.sendObject(
					{
						error:
							"Invalid message",
					},
				);
			}

			switch (
				message.type
			) {
				case "auth": {
					const claims =
						await verifyToken(
							(
								message as {
									token: string;
								}
							)
								.token,
						);
					if (
						!claims
					)
						return this.sendObject(
							{
								error:
									"Unauthorized",
							},
						);
					const userId =
						claims.id;
					if (
						websocketConnections.getByConnection(
							this,
						) &&
						websocketConnections.getByConnection(
							this,
						) !==
							userId
					)
						return this.sendObject(
							{
								error:
									"Already authenticated",
							},
						);
					this.#expires =
						claims.expires;
					clearTimeout(
						this
							.#expirationTimer,
					);
					this.#expirationTimer =
						setTimeout(
							() =>
								this.#ws.close(),
							claims.expires -
								Date.now(),
						);
					websocketConnections.add(
						userId,
						this,
					);
					this.#logger =
						this.#logger.child(
							{
								userId:
									userId,
							},
						);
					this.#logger.info(
						"Websocket authentication succeeded",
					);
					await markAsConnected(
						userId,
					);
					return this.sendObject(
						{
							type: "connection",
							connected: true,
						},
					);
				}
				default: {
					if (
						this
							.#expires <=
						Date.now()
					) {
						this.sendObject(
							{
								error:
									"Session expired",
							},
						);
						this.#ws.close();
						return;
					}
					const userId =
						websocketConnections.getByConnection(
							this,
						);
					if (
						!userId
					)
						return this.sendObject(
							{
								error:
									"Unauthorized",
							},
						);
					this.#processMessage(
						userId,
						message as {
							type: string;
						},
					);
				}
			}
		} catch (err) {
			this.#logger.warn(
				{
					err,
				},
				"Error processing websocket message",
			);
			return this.sendObject(
				{
					error:
						"Internal error",
				},
			);
		}
	}
	onClose(
		ws: WSContext,
	) {
		clearTimeout(
			this
				.#expirationTimer,
		);
		this.updateConnection(
			ws,
		);
		websocketConnections.removeConnection(
			this,
		);
		this.#logger.info(
			"Connection is closed",
		);
	}
}
