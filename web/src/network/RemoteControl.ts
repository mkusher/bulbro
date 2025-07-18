import type { PlayerControl } from "@/controls";
import { direction, zeroPoint } from "@/geometry";
import type { WebsocketMessage } from "./NetworkGameConnection";
import type { CurrentState } from "@/currentState";
import type { BulbroState } from "@/bulbro";

export class WebsocketDirectionRemember {
	#direction = zeroPoint();
	#lastPosition = zeroPoint();
	#isHost: boolean;
	#hostId: string;
	constructor(isHost: boolean, hostId: string) {
		this.#isHost = isHost;
		this.#hostId = hostId;
	}

	onMessage(message: WebsocketMessage) {
		switch (message.type) {
			case "game-state-updated-by-host":
				if (!this.#isHost) {
					this.#useHost(this.#hostId, message.state as CurrentState);
				}
				return;
			case "game-state-updated-by-player":
				if (this.#isHost) {
					this.#useNonHost(this.#hostId, message.state as CurrentState);
				}
				return;
		}
	}

	get direction() {
		return this.#direction;
	}

	#useHost(hostId: string, state: CurrentState) {
		const player = state.players.find((p) => p.id === hostId)!;
		this.#usePlayer(player);
	}
	#useNonHost(hostId: string, state: CurrentState) {
		const player = state.players.find((p) => p.id !== hostId)!;
		this.#usePlayer(player);
	}
	#usePlayer(player: BulbroState) {
		const newPosition = player.position;
		this.#direction = direction(this.#lastPosition, newPosition);
		this.#lastPosition = newPosition;
	}
}

export class RemoteRepeatLastKnownDirectionControl implements PlayerControl {
	#directionContainer: WebsocketDirectionRemember;

	constructor(directionContainer: WebsocketDirectionRemember) {
		this.#directionContainer = directionContainer;
	}

	async start() {}

	async stop() {}

	getDirection() {
		return this.#directionContainer.direction;
	}
}
