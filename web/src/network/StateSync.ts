import { computed, effect, type Signal } from "@preact/signals";
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
import type { WaveProcess } from "@/WaveProcess";
import { throttle } from "@/signals";

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
	#waveProcess: WaveProcess;

	constructor(
		logger: Logger,
		gameId: string,
		localPlayerId: string,
		isHost: boolean,
		inGameCommunicationChannel: InGameCommunicationChannel,
		processMessage: ProcessMessage,
		currentState: Signal<CurrentState>,
		localPlayerControl: PlayerControl,
		remoteControl: RemoteRepeatLastKnownDirectionControl,
		waveProcess: WaveProcess,
	) {
		this.#logger = logger;
		this.#gameId = gameId;
		this.#localPlayerId = localPlayerId;
		this.#isHost = isHost;
		this.#inGameCommunicationChannel = inGameCommunicationChannel;
		this.#processMessage = processMessage;
		this.#currentState = currentState;
		this.#localPlayerControl = localPlayerControl;
		this.#remotePlayerControl = remoteControl;

		this.#inGameCommunicationChannel.onMessage(this.#onMessage);
		this.#waveProcess = waveProcess;
	}

	#onMessage = (message: WebsocketMessage) => {
		if (!this.#isStarted) {
			return;
		}
		const currentVersion = this.#lastVersion ?? 0;
		const now = Date.now();
		switch (message.type) {
			case "game-state-updated-by-host":
			case "game-state-updated-by-guest": {
				if (currentVersion >= message.version) {
					this.#logger.warn(
						{
							versionReceived: message.version,
							lastVersion: currentVersion,
						},
						"Old version received",
					);
					this.#runPingPong(currentVersion + 1);
					return;
				}
			}
		}
		this.#processMessage(message);
		this.#remotePlayerControl.onMessage(message);
		switch (message.type) {
			case "game-state-updated-by-host": {
				if (this.#isHost) return;
				this.#lastVersion = message.version ?? currentVersion;
				this.#waveProcess.tick();
				this.#runPingPong(this.#lastVersion + 1);
				return;
			}
			case "game-state-updated-by-guest": {
				if (!this.#isHost) return;
				this.#lastVersion = message.version ?? currentVersion;
				this.#waveProcess.tick();
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
		const playerId = this.#localPlayerId;
		const playerPosition = throttle(
			computed(() => {
				const player = this.#currentState.value.players.find(
					(p) => p.id === playerId,
				);
				const direction = this.#localPlayerControl.direction;
				return {
					position: player?.position ?? zeroPoint(),
					direction,
				};
			}),
			20,
		);
		this.#localDispose = effect(() => {
			const { position, direction } = playerPosition.value;
			if (!this.#isStarted) return;

			this.#inGameCommunicationChannel.send({
				type: "game-state-position-updated",
				gameId: this.#gameId,
				playerId,
				position,
				direction,
				version: version++,
				sentAt: Date.now(),
			});
		});
	}

	async #runPingPong(version: number) {
		this.#lastVersion = version;
		await this.#inGameCommunicationChannel.send({
			type: this.#isHost
				? "game-state-updated-by-host"
				: "game-state-updated-by-guest",
			state: this.#currentState.value,
			gameId: this.#gameId,
			version,
			sentAt: Date.now(),
		});
	}

	stop() {
		this.#isStarted = false;
		this.#localDispose?.();
		this.#localDispose = undefined;
	}
}
