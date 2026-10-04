import { LobbyWebsocketMessage as WebsocketMessage } from "@bulbro/network-protocol";
import { type } from "arktype";

export type { Lobby } from "@bulbro/network-protocol";
export {
	Connected,
	GameStarted,
	Lobby as LobbySchema,
	LobbySnapshot,
	LobbyWebsocketMessage as WebsocketMessage,
	Player as PlayerAttendee,
	PlayerConnected,
	PlayerDisconnected,
	PlayerJoined,
	PlayerReady,
	ReadyPlayer as ReadyPlayerAttendee,
} from "@bulbro/network-protocol";

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
