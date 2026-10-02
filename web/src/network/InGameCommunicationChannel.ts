import type { WebsocketMessage } from "@bulbro/network-protocol";

export {
	HostStateUpdate,
	PlayerPositionUpdated,
	PlayerStateUpdate,
	WebsocketMessage,
} from "@bulbro/network-protocol";

/**
 * Messages exchanged while a wave is running.
 */
export type LiveStateMessage =
	Exclude<
		WebsocketMessage,
		{
			type:
				| "next-wave-player-ready"
				| "next-wave-player-not-ready"
				| "next-wave-started";
		}
	>;

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
