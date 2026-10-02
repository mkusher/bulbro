import { type } from "arktype";
import { LobbyWebsocketMessage as WebsocketMessage } from "@bulbro/network-protocol";
export {
	Player as PlayerAttendee,
	ReadyPlayer as ReadyPlayerAttendee,
	Lobby as LobbySchema,
	LobbyWebsocketMessage as WebsocketMessage,
	Connected,
	PlayerJoined,
	LobbySnapshot,
	PlayerReady,
	PlayerDisconnected,
	PlayerConnected,
	GameStarted,
} from "@bulbro/network-protocol";
export type { Lobby } from "@bulbro/network-protocol";

export function parseMessage(
	message: string,
) {
	const data =
		WebsocketMessage(
			JSON.parse(
				message,
			),
		);

	if (
		data instanceof
		type.errors
	) {
		throw data;
	}

	return data;
}
