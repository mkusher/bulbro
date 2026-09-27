import { WebsocketMessage } from "@bulbro/network-protocol";
import { type } from "arktype";
import type { Logger } from "pino";
import { registry } from "./games-registry";
import { websocketConnections } from "./websocket-connections";

export class WebsocketGameController {
	#logger: Logger;
	constructor(
		logger: Logger,
	) {
		this.#logger =
			logger;
	}
	routeMessage(
		userId: string,
		wsMessage: {
			type: string;
			[
				key: string
			]: unknown;
		},
	) {
		const message =
			WebsocketMessage(
				wsMessage,
			);
		if (
			message instanceof
			type.errors
		) {
			return;
		}
		switch (
			message.type
		) {
			case "game-state-updated-by-host":
			case "game-state-updated-by-guest":
			case "game-state-position-updated": {
				const game =
					registry.find(
						message.gameId,
					);
				if (
					!game
				) {
					this.#logger.error(
						{
							gameId:
								message.gameId,
						},
						"Game not found",
					);
					return;
				}
				if (
					!game.players.some(
						(
							p,
						) =>
							p.id ===
							userId,
					)
				)
					return;
				if (
					message.type ===
						"game-state-updated-by-host" &&
					userId !==
						game.hostId
				)
					return;
				if (
					message.type ===
						"game-state-updated-by-guest" &&
					userId ===
						game.hostId
				)
					return;
				if (
					message.type ===
						"game-state-position-updated" &&
					message.playerId !==
						userId
				)
					return;
				this.#logger.info(
					{
						messageType:
							message.type,
						gameId:
							message.gameId,
					},
					"Received a message",
				);
				const players =
					game.players.filter(
						(
							p,
						) =>
							p.id !==
							userId,
					);

				for (const player of players) {
					const connection =
						websocketConnections.get(
							player.id,
						);
					if (
						connection
					) {
						connection.sendObject(
							message,
						);
					}
				}
			}
		}
	}
}
