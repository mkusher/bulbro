import { type } from "arktype";

export const Player = type({
	id: "string",
	username: "string",
});

export const Weapon = type({
	id: "string",
	name: "string",
	classes: "string[]",
	statsBonus: "Record<string, string | number | boolean>",
	shotSpeed: "number",
});

export const Bulbro = type({
	id: "string",
	name: "string",
	baseStats: "Record<string, string | number | boolean>",
	weapons: Weapon.array(),
});

export const ReadyPlayer = type({
	id: "string",
	sprite: "string",
	bulbro: Bulbro,
});

export const Lobby = type({
	id: "string",
	hostId: "string",
	players: Player.array(),
	readyPlayers: ReadyPlayer.array(),
	createdAt: "number",
});

export type Player = typeof Player.infer;
export type ReadyPlayer = typeof ReadyPlayer.infer;
export type Lobby = typeof Lobby.infer;

export class GamesRegistry {
	#registry = new Map<string, Lobby>();

	registerLobby(host: Player) {
		const lobby: Lobby = {
			id: crypto.randomUUID(),
			hostId: host.id,
			players: [host],
			readyPlayers: [],
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

	markReady(id: string, readyPlayer: ReadyPlayer) {
		const game = this.#registry.get(id);
		if (!game) {
			return;
		}
		const lobby: Lobby = {
			...game,
			readyPlayers: [...game.readyPlayers, readyPlayer],
		};
		this.#registry.set(id, lobby);

		return lobby;
	}
}

export const registry = new GamesRegistry();
