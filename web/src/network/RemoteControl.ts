import type { PlayerControl } from "@/controls";
import { direction, zeroPoint } from "@/geometry";
import type { WebsocketMessage } from "./NetworkGameConnection";
import type { CurrentState } from "@/currentState";

export class RemoteRepeatLastKnownDirectionControl implements PlayerControl {
	#playerId: string;
	#direction = zeroPoint();
	#lastPosition = zeroPoint();
	#isHost: boolean;

	constructor(isHost: boolean, playerId: string) {
		this.#playerId = playerId;
		this.#isHost = isHost;
	}

	async start() {}

	async stop() {}

	onMessage(message: WebsocketMessage) {
		switch (message.type) {
			case "game-state-updated-by-host":
				if (!this.#isHost) {
					this.#useState(message.state as CurrentState);
				}
				return;
			case "game-state-updated-by-player":
				if (this.#isHost) {
					this.#useState(message.state as CurrentState);
				}
				return;
		}
	}

	getDirection() {
		return this.#direction;
	}

	#useState(state: CurrentState) {
		const player = state.players.find((p) => p.id === this.#playerId);
		if (!player) {
			this.#direction = zeroPoint();
			this.#lastPosition = zeroPoint();
			return;
		}
		const newPosition = player.position;
		this.#direction = direction(this.#lastPosition, newPosition);
		this.#lastPosition = newPosition;
	}
}
