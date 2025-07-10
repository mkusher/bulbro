import { signal } from "@preact/signals";
import { apiUrl, wsUrl } from "./clientConfig";
import { type } from "arktype";
import { currentUser } from "./currentUser";
import type { Player } from "@/player";

const PlayerAttendee = type({
	id: "string",
	username: "string",
	"status?": "string",
});
const LobbySchema = type({
	id: "string",
	createdAt: "number",
	hostId: "string",
	players: PlayerAttendee.array(),
});

type PlayerAttendee = typeof PlayerAttendee.infer;
type Lobby = typeof LobbySchema.infer;

export async function createLobby() {
	const url = new URL("game-lobby", apiUrl);
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			host: {
				id: currentUser.value.id,
				username: currentUser.value.username,
			},
		}),
	});
	const body = await res.json();

	const newLobby = LobbySchema(body.lobby);

	if (newLobby instanceof type.errors) {
		throw newLobby;
	}

	currentLobby.value = newLobby;
	startLobbyWebsocket();
}

export const currentLobby = signal<Lobby | null>(null);
export const readyPlayers = signal<Player[]>([]);

export async function joinLobby(id: string) {
	const url = new URL(`game-lobby/${id}/join-requests`, apiUrl);
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			player: {
				id: currentUser.value.id,
				username: currentUser.value.username,
			},
		}),
	});
	const body = await res.json();

	const newLobby = LobbySchema(body.lobby);

	if (newLobby instanceof type.errors) {
		throw newLobby;
	}

	currentLobby.value = newLobby;

	startLobbyWebsocket();
}

export async function markAsReady(id: string, player: Player) {
	const url = new URL(`game-lobby/${id}/ready`, apiUrl);

	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			player,
		}),
	});
	await res.json();

	readyPlayers.value = [...readyPlayers.value, player];
}

const Connected = type({ type: "'connection'", connected: "boolean" });
const PlayerJoined = type({ type: "'player-joined'", lobby: LobbySchema });
const PlayerReady = type({ type: "'player-ready'", readyPlayer: "object" });
const PlayerDisconnected = type({
	type: "'player-disconnected'",
	player: "object",
});
const WebsocketMessage = Connected.or(PlayerJoined)
	.or(PlayerReady)
	.or(PlayerDisconnected);

async function startLobbyWebsocket() {
	const { id: userId } = currentUser.value;
	const ws = new WebSocket(wsUrl);

	ws.addEventListener("close", () => {
		console.log("[WS] Close");
	});
	ws.addEventListener("open", () => {
		ws.send(JSON.stringify({ userId, type: "auth" }));
	});
	ws.addEventListener("message", (e) => {
		console.log("[WS] message", e);
		const message = parseMessage(e.data);
		return processMessage(message);
	});
	ws.addEventListener("error", (e) => {
		console.log("[WS] error", e);
	});

	return ws;
}

export function processMessage(message: typeof WebsocketMessage.infer) {
	switch (message.type) {
		case "connection": {
			console.log("Websocket connection", message.connected);
			return;
		}
		case "player-joined": {
			console.log("PlayerJoined", message.lobby);
			currentLobby.value = message.lobby;
			return;
		}
		case "player-ready": {
			console.log("player ready", message.readyPlayer);
			readyPlayers.value = [
				...readyPlayers.value,
				message.readyPlayer as Player,
			];
			return;
		}
		case "player-disconnected": {
			console.log("player ready", message.player);
			const player = message.player as PlayerAttendee;
			const playerId = player.id;
			const lobby = currentLobby.value;
			if (!lobby) return;
			currentLobby.value = {
				...lobby,
				players: lobby.players.map((p) => (p.id === playerId ? player : p)),
			};
			return;
		}
	}
}

export function parseMessage(message: string) {
	const data = WebsocketMessage(JSON.parse(message));

	if (data instanceof type.errors) {
		throw data;
	}

	return data;
}
