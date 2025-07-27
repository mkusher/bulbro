import type { Logger } from "@/logger";
import { type Lobby } from "./LobbySocketMessages";
import type { GameProcess, WavePromises } from "@/GameProcess";
import { StateSync } from "./StateSync";
import { createMainControls, type PlayerControl } from "@/controls";
import { RemoteRepeatLastKnownDirectionControl } from "./RemoteControl";
import { currentState } from "@/currentState";
import type {
	InGameCommunicationChannel,
	ProcessMessage,
} from "./InGameCommunicationChannel";
import { currentUser } from "./currentUser";

export class NetworkGameConnection {
	#logger: Logger;
	#inGameCommunicationChannel: InGameCommunicationChannel;
	#lobby: Lobby;
	#gameProcess: GameProcess;
	#stateSync!: StateSync;
	#isHost: boolean;
	#remoteControl: RemoteRepeatLastKnownDirectionControl;
	#mainControl: PlayerControl;
	#remotePlayerId: string;
	#processMessage: ProcessMessage;

	get id() {
		return this.#lobby.id;
	}

	constructor(
		logger: Logger,
		inGameCommunicationChannel: InGameCommunicationChannel,
		lobby: Lobby,
		gameProcess: GameProcess,
		processMessage: ProcessMessage,
		isHost: boolean,
	) {
		this.#logger = logger;
		this.#lobby = lobby;
		this.#remotePlayerId = this.#lobby.players.find(
			(p) => p.id !== this.#lobby.hostId,
		)!.id;
		this.#gameProcess = gameProcess;
		this.#inGameCommunicationChannel = inGameCommunicationChannel;
		this.#isHost = isHost;
		this.#mainControl = createMainControls();
		this.#remoteControl = new RemoteRepeatLastKnownDirectionControl(
			this.#isHost,
			this.#remotePlayerId,
		);
		this.#processMessage = processMessage;
	}

	createControls() {
		return [this.#mainControl, this.#remoteControl];
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

	#startStateSync(isHost: boolean) {
		this.#stateSync = new StateSync(
			this.#logger.child({ component: "state-sync" }),
			this.#lobby.id,
			currentUser.value.id,
			isHost,
			this.#inGameCommunicationChannel,
			this.#processMessage,
			currentState,
			this.#mainControl,
			this.#remoteControl,
		);
		this.#stateSync.start();
	}
}
