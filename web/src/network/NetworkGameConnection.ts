import type { Logger } from "@/logger";
import { type Lobby } from "./LobbySocketMessages";
import type { GameProcess, WavePromises } from "@/GameProcess";
import { StateSync } from "./StateSync";
import { StateUpdater } from "./StateUpdater";
import { createMainControls, type PlayerControl } from "@/controls";
import { RemoteRepeatLastKnownDirectionControl } from "./RemoteControl";
import { currentState } from "@/currentState";
import type { InGameCommunicationChannel } from "./InGameCommunicationChannel";
import { currentUser } from "./currentUser";
import type { WaveProcess } from "@/WaveProcess";

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

	get id() {
		return this.#lobby.id;
	}

	constructor(
		logger: Logger,
		inGameCommunicationChannel: InGameCommunicationChannel,
		lobby: Lobby,
		gameProcess: GameProcess,
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
	}

	createControls() {
		return [this.#mainControl, this.#remoteControl];
	}

	onStart({ waveInitPromise, wavePromise }: WavePromises) {
		waveInitPromise.then((waveProcess) => {
			this.#startStateSync(this.#isHost, waveProcess);
		});

		wavePromise.finally(() => {
			this.#stateSync.stop();
		});
	}

	startRemote() {
		const { wavePromise, waveInitPromise } = this.#gameProcess.startWave(
			this.createControls(),
		);

		return { wavePromise, waveInitPromise };
	}

	#startStateSync(isHost: boolean, waveProcess: WaveProcess) {
		const stateUpdater = new StateUpdater({
			logger: this.#logger.child({ component: "state-updater" }),
			currentState,
			currentUser,
			waveProcess,
			isHost,
		});

		this.#stateSync = new StateSync({
			logger: this.#logger.child({ component: "state-sync" }),
			gameId: this.#lobby.id,
			localPlayerId: currentUser.value.id,
			isHost,
			inGameCommunicationChannel: this.#inGameCommunicationChannel,
			stateUpdater,
			currentState,
			localPlayerControl: this.#mainControl,
			remoteControl: this.#remoteControl,
			waveProcess,
			gameEventQueue: waveProcess.eventQueue,
		});
		this.#stateSync.start();
	}
}
