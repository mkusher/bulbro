import {
	LobbyPlayerUpdated,
	WebsocketMessage,
} from "@bulbro/network-protocol";
import { type } from "arktype";
import type { Logger } from "pino";
import {
	markNotReadyForNextWave,
	markReadyForNextWave,
} from "./game-controller";
import type { GamesRegistry } from "./games-registry";

/**
 * Collects shop readiness and starts the next wave.
 */
export type NextWaveCoordinator =
	{
		markReady(
			gameId: string,
			wave: number,
			playerId: string,
			player: object,
		): boolean;
		markNotReady(
			gameId: string,
			wave: number,
			playerId: string,
		): boolean;
	};

const defaultNextWave: NextWaveCoordinator =
	{
		markReady:
			markReadyForNextWave,
		markNotReady:
			markNotReadyForNextWave,
	};

export type GameRelayDependencies =
	{
		rooms: Pick<
			GamesRegistry,
			| "find"
			| "updateLobbyPlayer"
			| "updateShopPlayer"
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
		nextWave?: NextWaveCoordinator;
	};

export class WebsocketGameController {
	#logger: Logger;
	#rooms: GameRelayDependencies["rooms"];
	#connections: GameRelayDependencies["connections"];
	#nextWave: NextWaveCoordinator;
	constructor(
		logger: Logger,
		{
			rooms,
			connections,
			nextWave = defaultNextWave,
		}: GameRelayDependencies,
	) {
		this.#nextWave =
			nextWave;
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
		const loadout =
			LobbyPlayerUpdated(
				wsMessage,
			);
		if (
			!(
				loadout instanceof
				type.errors
			)
		) {
			if (
				loadout
					.player
					.id !==
				userId
			)
				return;
			const lobby =
				this.#rooms.updateLobbyPlayer(
					loadout.gameId,
					loadout.player,
				);
			if (
				!lobby
			)
				return;
			for (const member of lobby.players)
				if (
					member.id !==
					userId
				)
					this.#connections
						.get(
							member.id,
						)
						?.sendObject(
							loadout,
						);
			return;
		}
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
			case "shop-player-updated": {
				if (
					message.playerId !==
						userId ||
					message
						.player
						.id !==
						userId ||
					!this.#rooms.updateShopPlayer(
						message.gameId,
						message.wave,
						userId,
						message.player,
					)
				)
					return;
				const game =
					this.#rooms.find(
						message.gameId,
					);
				if (
					!game
				)
					return;
				for (const member of game.players)
					if (
						member.id !==
						userId
					)
						this.#connections
							.get(
								member.id,
							)
							?.sendObject(
								{
									...message,
									sentAt:
										Date.now(),
								},
							);
				return;
			}
			case "next-wave-player-ready": {
				if (
					message.playerId !==
						userId ||
					message
						.player
						.id !==
						userId
				)
					return;
				const accepted =
					this.#nextWave.markReady(
						message.gameId,
						message.wave,
						userId,
						message.player,
					);
				this.#logger.info(
					{
						gameId:
							message.gameId,
						wave: message.wave,
						playerId:
							userId,
						accepted,
					},
					"Player ready for the next wave",
				);
				return;
			}
			case "next-wave-player-not-ready": {
				if (
					message.playerId !==
					userId
				)
					return;
				const accepted =
					this.#nextWave.markNotReady(
						message.gameId,
						message.wave,
						userId,
					);
				this.#logger.info(
					{
						gameId:
							message.gameId,
						wave: message.wave,
						playerId:
							userId,
						accepted,
					},
					"Player is not ready for the next wave",
				);
				return;
			}
			case "next-wave-started":
				// Only the server announces wave starts.
				return;
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
