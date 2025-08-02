import { effect, type Signal } from "@preact/signals";
import type {
	InGameCommunicationChannel,
	ProcessMessage,
	WebsocketMessage,
} from "./InGameCommunicationChannel";
import type { CurrentState } from "@/currentState";
import type { RemoteRepeatLastKnownDirectionControl } from "./RemoteControl";
import type { Logger } from "pino";
import { zeroPoint } from "@/geometry";
import type { PlayerControl } from "@/controls";

export const defaultInterval = 5;
export const persistDelay = 50;

export class StateSync {
	#logger: Logger;
	#isStarted = false;
	#inGameCommunicationChannel: InGameCommunicationChannel;
	#processMessage: ProcessMessage;
	#currentState: Signal<CurrentState>;
	#remotePlayerControl: RemoteRepeatLastKnownDirectionControl;
	#localPlayerControl: PlayerControl;
	#isHost: boolean;
	#lastVersion: number | null = null;
	#gameId: string;
	#localPlayerId: string;
	#localDispose?: () => void;

	constructor(
		logger: Logger,
		gameId: string,
		playerId: string,
		isHost: boolean,
		inGameCommunicationChannel: InGameCommunicationChannel,
		processMessage: ProcessMessage,
		currentState: Signal<CurrentState>,
		localPlayerControl: PlayerControl,
		remoteControl: RemoteRepeatLastKnownDirectionControl,
	) {
		this.#logger = logger;
		this.#gameId = gameId;
		this.#localPlayerId = playerId;
		this.#isHost = isHost;
		this.#inGameCommunicationChannel = inGameCommunicationChannel;
		this.#processMessage = processMessage;
		this.#currentState = currentState;
		this.#localPlayerControl = localPlayerControl;
		this.#remotePlayerControl = remoteControl;

		this.#inGameCommunicationChannel.onMessage(this.#onMessage);
	}

	#onMessage = (message: WebsocketMessage) => {
		if (!this.#isStarted) {
			return;
		}
		switch (message.type) {
			case "game-state-updated-by-host":
			case "game-state-updated-by-guest": {
				if (this.#lastVersion ?? 0 >= message.version) {
					this.#logger.warn(
						{
							versionReceived: message.version,
							lastVersion: this.#lastVersion,
						},
						"Old version received",
					);
					this.#runPingPong(this.#lastVersion ?? 0 + 1);
					return;
				}
			}
		}
		this.#processMessage(message);
		this.#remotePlayerControl.onMessage(message);
		switch (message.type) {
			case "game-state-updated-by-host": {
				if (this.#isHost) return;
				this.#lastVersion = message.version ?? 0;
				this.#runPingPong(this.#lastVersion + 1);
				return;
			}
			case "game-state-updated-by-guest": {
				if (!this.#isHost) return;
				this.#lastVersion = message.version ?? 0;
				this.#runPingPong(this.#lastVersion + 1);
				return;
			}
		}
	};

	start() {
		if (this.#isStarted) {
			return;
		}
		this.#isStarted = true;
		if (this.#isHost) {
			this.#runPingPong((this.#lastVersion ?? 0) + 1);
		}
		let version = 0;
		this.#localDispose = effect(() => {
			const playerId = this.#localPlayerId;
			const direction = this.#localPlayerControl.direction;
			const player = this.#currentState.value.players.find(
				(p) => p.id === playerId,
			);
			if (!this.#isStarted) return;

			this.#inGameCommunicationChannel.send({
				type: "game-state-position-updated",
				gameId: this.#gameId,
				playerId,
				position: player?.position ?? zeroPoint(),
				direction,
				version: version++,
			});
		});
	}

	async #runPingPong(version: number) {
		await this.#inGameCommunicationChannel.send({
			type: this.#isHost
				? "game-state-updated-by-host"
				: "game-state-updated-by-guest",
			state: this.#currentState.value,
			gameId: this.#gameId,
			version,
		});
	}

	stop() {
		this.#isStarted = false;
		this.#localDispose?.();
		this.#localDispose = undefined;
	}
}
