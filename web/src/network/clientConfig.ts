export let apiUrl =
	new URL(
		"/api/",
		window
			.location
			.href,
	);
const wsProtocol =
	window
		.location
		.protocol ===
	"https:"
		? "wss"
		: "ws";
export let wsUrl =
	new URL(
		`${wsProtocol}://${window.location.host}/ws`,
	);

export function configureNetworkServer(
	serverUrl:
		| string
		| URL,
) {
	const origin =
		new URL(
			serverUrl,
		)
			.origin;
	const server =
		new URL(
			origin,
		);
	apiUrl =
		new URL(
			"/api/",
			server,
		);
	server.protocol =
		server.protocol ===
		"https:"
			? "wss:"
			: "ws:";
	wsUrl =
		new URL(
			"/ws",
			server,
		);
}

export function useSameOriginNetworkServer() {
	configureNetworkServer(
		window
			.location
			.origin,
	);
}
