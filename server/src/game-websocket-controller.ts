import { WebsocketMessage } from "@bulbro/network-protocol";
import { type } from "arktype";
import type { Logger } from "pino";
import type { GamesRegistry } from "./games-registry";

export type GameRelayDependencies =
	{
		rooms: Pick<
			GamesRegistry,
			"find"
		>;
		connections: {
			get(
				userId: string,
			):
				| {
						sendObject(
							message: object,
						): void;
				  }
				| undefined;
		};
	};

export class WebsocketGameController {
	#logger: Logger;
	#rooms: GameRelayDependencies["rooms"];
	#connections: GameRelayDependencies["connections"];
	constructor(
		logger: Logger,
		{
			rooms,
			connections,
		}: GameRelayDependencies,
	) {
		this.#logger =
			logger;
		this.#rooms =
			rooms;
		this.#connections =
			connections;
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
					this.#rooms.find(
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
						this.#connections.get(
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
