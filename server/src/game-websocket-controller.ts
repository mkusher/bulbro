import { type } from "arktype";
import { registry } from "./games-registry";
import { websocketConnections } from "./websocket-connections";
import type { Logger } from "pino";

const Point = type({
	x: "number",
	y: "number",
});
export const HostStateUpdate = type({
	type: "'game-state-updated-by-host'",
	gameId: "string",
	version: "number",
	state: "object",
});
export const PlayerStateUpdate = type({
	type: "'game-state-updated-by-guest'",
	gameId: "string",
	state: "object",
	version: "number",
});
export const PlayerPositionUpdated = type({
	type: "'game-state-position-updated'",
	gameId: "string",
	playerId: "string",
	position: Point,
	direction: Point,
	version: "number",
});
export const Message = HostStateUpdate.or(PlayerStateUpdate).or(
	PlayerPositionUpdated,
);

export class WebsocketGameController {
	#logger: Logger;
	constructor(logger: Logger) {
		this.#logger = logger;
	}
	routeMessage(wsMessage: { type: string }) {
		const message = Message(wsMessage);
		if (message instanceof type.errors) {
			return;
		}
		switch (message.type) {
			case "game-state-updated-by-host":
			case "game-state-updated-by-guest":
			case "game-state-position-updated":
				const game = registry.find(message.gameId);
				if (!game) {
					this.#logger.error({ gameId: message.gameId }, "Game not found");
					return;
				}
				this.#logger.info(
					{ messageType: message.type, gameId: message.gameId },
					"Received a message",
				);
				const playerId =
					message.type === "game-state-updated-by-host"
						? game.hostId
						: message.type === "game-state-updated-by-guest"
							? game.players.find((p) => p.id !== game.hostId)!.id
							: message.playerId;

				const players = game.players.filter((p) => p.id !== playerId);

				for (const player of players) {
					const connection = websocketConnections.get(player.id);
					if (connection) {
						connection.sendObject(message);
					}
				}
		}
	}
}
