const apiUrl = "http://45.10.163.180:3000/api";
const wsUrl = "http://45.10.163.180:3000/ws";

export async function createUser() {
	const url = new URL("/users", apiUrl);
	const res = await fetch(url, {
		method: "POST",
	});
	const body = await res.json();

	console.log(body);
}

export async function createLobby() {
	const url = new URL("/game-lobby", apiUrl);
	const res = await fetch(url, {
		method: "POST",
	});
	const body = await res.json();

	console.log(body);

	startLobbyWebsocket();
}

export async function joinLobby(id: string) {
	const url = new URL(`/game-lobby/${id}/join-requests`, apiUrl);
	const res = await fetch(url, {
		method: "POST",
	});
	const body = await res.json();

	console.log(body);

	startLobbyWebsocket();
}

async function startLobbyWebsocket() {
	const ws = new WebSocket(wsUrl);

	ws.addEventListener("close", () => {
		console.log("[WS] Close");
	});
	ws.addEventListener("open", () => {
		console.log("[WS] Open");
	});
	ws.addEventListener("message", () => {
		console.log("[WS] message");
	});
	ws.addEventListener("error", () => {
		console.log("[WS] error");
	});

	return ws;
}
