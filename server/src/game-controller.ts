import { type } from "arktype";
import { registry, type Lobby } from "./games-registry";
import { websocketConnections } from "./websocket-connections";

export const GameState = type("Record<string, unknown>");

export async function startGame(id: string, initialState: object) {
	const lobby = registry.find(id);
	if (!lobby) {
		return;
	}

	const serverStartTime = Date.now();

	lobby.players.forEach((player) => {
		if (player.id === lobby.hostId) {
			return;
		}
		const socket = websocketConnections.get(player.id);

		socket?.sendObject({
			type: "game-started",
			lobby,
			initialState,
			serverStartTime,
		});
	});
}

export async function hostUpdate(id: string, state: object) {
	const lobby = registry.find(id);
	if (!lobby) {
		return;
	}

	const serverUpdateTime = Date.now();

	lobby.players.forEach((player) => {
		if (player.id === lobby.hostId) {
			return;
		}
		const socket = websocketConnections.get(player.id);

		socket?.sendObject({
			type: "game-state-updated-by-host",
			lobby,
			state,
			serverUpdateTime,
		});
	});
}

export async function playerUpdate(id: string, state: object) {
	const lobby = registry.find(id);
	if (!lobby) {
		return;
	}

	const serverUpdateTime = Date.now();

	lobby.players.forEach((player) => {
		if (player.id !== lobby.hostId) {
			return;
		}
		const socket = websocketConnections.get(player.id);

		socket?.sendObject({
			type: "game-state-updated-by-player",
			lobby,
			state,
			serverUpdateTime,
		});
	});
}
