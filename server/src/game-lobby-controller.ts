import { type Player, ReadyPlayer, registry } from "./games-registry";
import { websocketConnections } from "./websocket-connections";

export async function joinLobby(id: string, player: Player) {
	const lobby = registry.addPlayer(id, player);

	if (!lobby) {
		return;
	}

	const hostSocket = websocketConnections.get(lobby.hostId);
	if (hostSocket) {
		hostSocket.send(
			JSON.stringify({
				type: "player-joined",
				lobby,
			}),
		);
	}
	return lobby;
}

export async function markPlayerReady(id: string, readyPlayer: ReadyPlayer) {
	const lobby = registry.markReady(id, readyPlayer);

	if (!lobby) {
		return;
	}

	lobby.players.forEach((p) => {
		if (p.id === readyPlayer.id) {
			return;
		}
		const socket = websocketConnections.get(lobby.hostId);
		if (socket) {
			socket.send(
				JSON.stringify({
					type: "player-ready",
					readyPlayer,
				}),
			);
		}
	});
	return lobby;
}
