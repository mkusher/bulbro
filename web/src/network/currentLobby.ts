import { signal } from "@preact/signals";
import { apiUrl, wsUrl } from "./clientConfig";
import { type } from "arktype";
import { currentUser } from "./currentUser";

const LobbySchema = type({
	id: "string",
	createdAt: "number",
	hostId: "string",
	players: type({
		id: "string",
		username: "string",
	}).array(),
});

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

const Connected = type({ type: "'connection'", connected: "boolean" });
const LobbyUpdate = type({ type: "'lobby-update'", lobby: LobbySchema });
const WebsocketMessage = Connected.or(LobbyUpdate);

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
		case "lobby-update": {
			console.log("Lobby update", message.lobby);
			currentLobby.value = message.lobby;
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
