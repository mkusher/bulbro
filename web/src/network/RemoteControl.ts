import type { PlayerControl } from "@/controls";
import { zeroPoint } from "@/geometry";
import type { WebsocketMessage } from "./InGameCommunicationChannel";
import { signal } from "@preact/signals";
import type { BulbroMovedEvent, GameEvent } from "@/game-events/GameEvents";

export class RemoteRepeatLastKnownDirectionControl implements PlayerControl {
	#playerId: string;
	#direction = signal(zeroPoint());
	#lastPosition = signal(zeroPoint());
	#isHost: boolean;
	#isStarted: boolean = false;

	constructor(isHost: boolean, playerId: string) {
		this.#playerId = playerId;
		this.#isHost = isHost;
	}

	async start() {
		this.#isStarted = true;
	}

	async stop() {
		this.#isStarted = false;
	}

	onMessage(message: WebsocketMessage) {
		if (!this.#isStarted) return;
		switch (message.type) {
			case "game-state-updated-by-host":
				if (!this.#isHost) {
					this.#useEvents(message.events as GameEvent[]);
				}
				return;
			case "game-state-updated-by-guest":
				if (this.#isHost) {
					this.#useEvents(message.events as GameEvent[]);
				}
				return;
		}
	}

	get signal() {
		return this.#direction;
	}

	get direction() {
		return this.#direction.value;
	}

	#useEvents(events: GameEvent[]) {
		const playerEvents = events.filter(
			(event) =>
				event.type === "bulbroMoved" && event.bulbroId === this.#playerId,
		) as BulbroMovedEvent[];
		const event = playerEvents.pop();
		if (!event) {
			this.#direction.value = zeroPoint();
			this.#lastPosition.value = zeroPoint();
			return;
		}
		const newPos = event.to;
		const direction = event.direction;
		this.#direction.value = direction;
		this.#lastPosition.value = newPos;
	}
}
