import type { WebsocketMessage } from "@bulbro/network-protocol";

export {
	HostStateUpdate,
	PlayerPositionUpdated,
	PlayerStateUpdate,
	WebsocketMessage,
} from "@bulbro/network-protocol";

export type ProcessMessage =
	(
		message: typeof WebsocketMessage.infer,
	) => void;

export interface InGameCommunicationChannel {
	send(
		message: WebsocketMessage,
	): Promise<void>;
	onMessage(
		f: ProcessMessage,
	): () => void;
}
