import { type } from "arktype";

export const Player = type({
	id: "string",
	username: "string",
});

export const Lobby = type({
	id: "string",
	hostId: "string",
	players: Player.array(),
});

type Player = typeof Player.infer;
type Lobby = typeof Lobby.infer;

export class GamesRegistry {
	#registry = new Map<string, Lobby>();

	registerLobby(host: Player) {
		const lobby = {
			id: crypto.randomUUID(),
			hostId: host.id,
			players: [host],
			createdAt: Date.now(),
		};
		this.#registry.set(lobby.id, lobby);
		return lobby;
	}

	find(id: string) {
		return this.#registry.get(id);
	}

	addPlayer(id: string, player: Player) {
		const game = this.#registry.get(id);
		if (!game) {
			return;
		}

		const lobby = {
			...game,
			players: [...game.players, player],
		};
		this.#registry.set(id, lobby);

		return lobby;
	}
}

export const registry = new GamesRegistry();
