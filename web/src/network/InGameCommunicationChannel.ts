import { type } from "arktype";

const Point = type({
	x: "number",
	y: "number",
});
export const HostStateUpdate = type({
	type: "'game-state-updated-by-host'",
	gameId: "string",
	version: "number",
	state: "object",
	sentAt: "number",
});
export const PlayerStateUpdate = type({
	type: "'game-state-updated-by-guest'",
	gameId: "string",
	state: "object",
	version: "number",
	sentAt: "number",
});
export const PlayerPositionUpdated = type({
	type: "'game-state-position-updated'",
	gameId: "string",
	playerId: "string",
	position: Point,
	direction: Point,
	version: "number",
	sentAt: "number",
});
export const WebsocketMessage = HostStateUpdate.or(PlayerStateUpdate).or(
	PlayerPositionUpdated,
);
export type WebsocketMessage = typeof WebsocketMessage.infer;

export type ProcessMessage = (message: typeof WebsocketMessage.infer) => void;

export interface InGameCommunicationChannel {
	send(message: WebsocketMessage): Promise<void>;
	onMessage(f: ProcessMessage): () => void;
}
