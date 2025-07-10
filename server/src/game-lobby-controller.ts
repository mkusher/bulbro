import { type Player, ReadyPlayer, registry } from "./games-registry";
import { websocketConnections } from "./websocket-connections";

export async function joinLobby(id: string, player: Player) {
	const lobby = registry.addPlayer(id, player);

	if (!lobby) {
		return;
	}

	await sendUpdatesToPlayers(
		lobby.players.filter((p) => p.id !== player.id).map((p) => p.id),
		{
			type: "player-joined",
			lobby,
		},
	);
	return lobby;
}

export async function markPlayerReady(id: string, readyPlayer: ReadyPlayer) {
	const lobby = registry.markReady(id, readyPlayer);

	if (!lobby) {
		return;
	}
	await sendUpdatesToPlayers(
		lobby.players.filter((p) => p.id !== readyPlayer.id).map((p) => p.id),
		{
			type: "player-ready",
			readyPlayer,
		},
	);

	return lobby;
}

export async function markAsDisconnected(playerId: string) {
	const games = registry.findGamesForPlayer(playerId);
	for (const id of games) {
		const lobby = registry.markDisconnected(id, playerId);

		if (!lobby) {
			return;
		}

		const player = lobby.players.find((p) => p.id === playerId);

		await sendUpdatesToPlayers(
			lobby.players.filter((p) => p.id !== playerId).map((p) => p.id),
			{
				type: "player-disconnected",
				player,
			},
		);
	}
}

async function sendUpdatesToPlayers(players: string[], message: object) {
	players.forEach((p) => {
		const socket = websocketConnections.get(p);
		if (socket) {
			socket.send(JSON.stringify(message));
		}
	});
}
