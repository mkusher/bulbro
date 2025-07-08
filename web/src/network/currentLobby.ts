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
	});
	const body = await res.json();

	console.log(body);

	currentLobby.value = body;

	startLobbyWebsocket();
}

async function startLobbyWebsocket() {
	const { id: userId } = currentUser.value;
	const ws = new WebSocket(wsUrl);

	ws.addEventListener("close", () => {
		console.log("[WS] Close");
	});
	ws.addEventListener("open", () => {
		console.log("[WS] Open");
		ws.send(JSON.stringify({ userId, type: "auth" }));
	});
	ws.addEventListener("message", () => {
		console.log("[WS] message");
	});
	ws.addEventListener("error", () => {
		console.log("[WS] error");
	});

	return ws;
}
