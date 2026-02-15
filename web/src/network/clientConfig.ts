export const apiUrl =
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
export const wsUrl =
	new URL(
		`${wsProtocol}://${window.location.host}/ws`,
	);
