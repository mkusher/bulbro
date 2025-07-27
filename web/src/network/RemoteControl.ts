import type { PlayerControl } from "@/controls";
import { direction, zeroPoint } from "@/geometry";
import type { WebsocketMessage } from "./InGameCommunicationChannel";
import type { CurrentState } from "@/currentState";
import { signal } from "@preact/signals";

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
					this.#useState(message.state as CurrentState);
				}
				return;
			case "game-state-updated-by-guest":
				if (this.#isHost) {
					this.#useState(message.state as CurrentState);
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

	#useState(state: CurrentState) {
		const player = state.players.find((p) => p.id === this.#playerId);
		if (!player) {
			this.#direction.value = zeroPoint();
			this.#lastPosition.value = zeroPoint();
			return;
		}
		const newPosition = player.position;
		this.#direction.value =
			player.lastDirection ?? direction(this.#lastPosition.value, newPosition);
		this.#lastPosition.value = newPosition;
	}
}
