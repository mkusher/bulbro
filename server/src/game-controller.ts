import { type } from "arktype";
import { registry } from "./games-registry";
import { websocketConnections } from "./websocket-connections";

export const GameState =
	type(
		"Record<string, unknown>",
	);

export async function startGame(
	id: string,
	initialState: object,
) {
	const lobby =
		registry.find(
			id,
		);
	if (
		!lobby
	) {
		return;
	}

	const serverStartTime =
		Date.now();
	registry.markGameStarted(
		id,
	);

	lobby.players.forEach(
		(
			player,
		) => {
			if (
				player.id ===
				lobby.hostId
			) {
				return;
			}
			const socket =
				websocketConnections.get(
					player.id,
				);

			socket?.sendObject(
				{
					type: "game-started",
					lobby,
					initialState,
					serverStartTime,
				},
			);
		},
	);
}

/**
 * Records that a player finished shopping, notifies the other players, and
 * starts the next wave when everyone is ready.
 */
export function markReadyForNextWave(
	id: string,
	wave: number,
	playerId: string,
	player: object,
) {
	const readiness =
		registry.markReadyForNextWave(
			id,
			wave,
			playerId,
			player,
		);
	const lobby =
		registry.find(
			id,
		);
	if (
		!readiness ||
		!lobby
	)
		return false;

	for (const member of lobby.players) {
		if (
			member.id ===
			playerId
		)
			continue;
		websocketConnections
			.get(
				member.id,
			)
			?.sendObject(
				{
					type: "next-wave-player-ready",
					gameId:
						id,
					wave,
					playerId,
					player,
					sentAt:
						Date.now(),
				},
			);
	}

	startNextWaveIfReady(
		id,
	);
	return true;
}

/**
 * Withdraws a player's readiness and notifies the other players. Ignored once
 * the wave has started.
 */
export function markNotReadyForNextWave(
	id: string,
	wave: number,
	playerId: string,
) {
	const readiness =
		registry.markNotReadyForNextWave(
			id,
			wave,
			playerId,
		);
	const lobby =
		registry.find(
			id,
		);
	if (
		!readiness ||
		!lobby
	)
		return false;

	for (const member of lobby.players) {
		if (
			member.id ===
			playerId
		)
			continue;
		websocketConnections
			.get(
				member.id,
			)
			?.sendObject(
				{
					type: "next-wave-player-not-ready",
					gameId:
						id,
					wave,
					playerId,
					sentAt:
						Date.now(),
				},
			);
	}
	return true;
}

/**
 * Sends `next-wave-started` to every player once all of them are ready and
 * have a registered socket.
 */
export function startNextWaveIfReady(
	id: string,
) {
	const lobby =
		registry.find(
			id,
		);
	const next =
		registry.nextWaveToStart(
			id,
		);
	if (
		!lobby ||
		!next ||
		!lobby.players.every(
			(
				player,
			) =>
				websocketConnections.get(
					player.id,
				),
		)
	)
		return false;

	registry.markNextWaveStarted(
		id,
		next.wave,
	);
	const message =
		{
			type: "next-wave-started",
			gameId:
				id,
			wave: next.wave,
			players:
				next.players,
			serverStartTime:
				Date.now(),
		};
	for (const player of lobby.players) {
		websocketConnections
			.get(
				player.id,
			)
			?.sendObject(
				message,
			);
	}
	return true;
}
