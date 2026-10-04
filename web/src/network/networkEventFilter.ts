import type { GameEvent } from "@/game-events/GameEvents";

export function isLocallyAuthoritativeEvent(
	event: GameEvent,
	isHost: boolean,
	localPlayerId: string,
): boolean {
	if (
		isHost
	) {
		return (
			event.type !==
				"bulbroMoved" ||
			event.bulbroId ===
				localPlayerId
		);
	}
	return (
		event.type ===
			"bulbroMoved" &&
		event.bulbroId ===
			localPlayerId
	);
}

/** Remote movement is predicted locally, but only its owner broadcasts it. */
export function isLocallySimulatedEvent(
	event: GameEvent,
	isHost: boolean,
): boolean {
	return (
		isHost ||
		event.type ===
			"bulbroMoved"
	);
}
