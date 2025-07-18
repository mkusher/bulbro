import type { Logger } from "@/logger";
import type { WebsocketConnection } from "./WebsocketConnection";
import { LobbySchema, type Lobby } from "./LobbySocketMessages";
import { type } from "arktype";
import type { GameProcess, WavePromises } from "@/GameProcess";
import { StateSync } from "./StateSync";
import { createMainControls } from "@/controls";
import {
	RemoteRepeatLastKnownDirectionControl,
	WebsocketDirectionRemember,
} from "./RemoteControl";
import { currentState } from "@/currentState";

export const HostStateUpdate = type({
	type: "'game-state-updated-by-host'",
	lobby: LobbySchema,
	state: "object",
	serverUpdateTime: "number",
});
export const PlayerStateUpdate = type({
	type: "'game-state-updated-by-player'",
	lobby: LobbySchema,
	state: "object",
	serverUpdateTime: "number",
});
export const WebsocketMessage = HostStateUpdate.or(PlayerStateUpdate);
export type WebsocketMessage = typeof WebsocketMessage.infer;

export type ProcessMessage = (message: typeof WebsocketMessage.infer) => void;

export class NetworkGameConnection {
	#logger: Logger;
	#connection: WebsocketConnection;
	#lobby: Lobby;
	#processMessage: ProcessMessage;
	#gameProcess: GameProcess;
	#stateSync!: StateSync;
	#isHost: boolean;
	#directionContainer!: WebsocketDirectionRemember;
	get id() {
		return this.#lobby.id;
	}
	constructor(
		logger: Logger,
		connection: WebsocketConnection,
		lobby: Lobby,
		gameProcess: GameProcess,
		processMessage: ProcessMessage,
		isHost: boolean,
	) {
		this.#logger = logger;
		this.#connection = connection;
		this.#lobby = lobby;
		this.#gameProcess = gameProcess;
		this.#processMessage = processMessage;
		this.#isHost = isHost;
		this.#subscribeToSocket();
	}

	createControls() {
		return [
			createMainControls(),
			new RemoteRepeatLastKnownDirectionControl(this.#directionContainer),
		];
	}

	onStart({ waveInitPromise, wavePromise }: WavePromises) {
		waveInitPromise.then(() => {
			this.#startStateSync(this.#isHost);
		});

		wavePromise.finally(() => {
			this.#stateSync.stop();
		});
	}

	startRemote() {
		const { wavePromise, waveInitPromise } = this.#gameProcess.startWave(
			this.createControls(),
		);

		this.onStart({ waveInitPromise, wavePromise });

		return { wavePromise, waveInitPromise };
	}

	#subscribeToSocket() {
		this.#directionContainer = new WebsocketDirectionRemember(
			this.#isHost,
			this.#lobby.hostId,
		);
		this.#connection.onMessage((event) => {
			const message = WebsocketMessage(JSON.parse(event.data));
			if (message instanceof type.errors) {
				this.#logger.warn({ err: message }, "Unknown message received");
				return;
			}
			this.#logger.debug({ message }, "In game message received");
			this.#directionContainer.onMessage(message);
			this.#processMessage(message);
		});
	}

	#startStateSync(isHost: boolean) {
		const url = isHost
			? `game/${this.#lobby.id}/host`
			: `game/${this.#lobby.id}/player`;
		this.#stateSync = new StateSync(url, () => currentState.value);
		this.#stateSync.start();
	}
}
