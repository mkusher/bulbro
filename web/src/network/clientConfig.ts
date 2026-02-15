export const apiUrl =
	"/api/";
const wsProtocol =
	window
		.location
		.protocol ===
	"https:"
		? "wss"
		: "ws";
export const wsUrl = `${wsProtocol}://${window.location.host}/ws`;
