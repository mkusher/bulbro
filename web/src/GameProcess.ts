import type { Logger } from "pino";
import { logger as defaultLogger } from "./logger";
import {
	createInitialState,
	waveState,
	nextWave,
	type WaveState,
} from "./waveState";
import { type Player } from "./player";
import { type Difficulty } from "./game-formulas";
import { WaveProcess } from "./WaveProcess";
import { classicMapSize } from "./game-canvas";
import type { PlayerControl } from "./controls";
import { withEventMeta, type GameEvent } from "./game-events/GameEvents";
import { deltaTime, nowTime } from "./time";
import { currentGameCanvas } from "./currentGameProcess";

export type WavePromises = {
	waveInitPromise: Promise<WaveProcess>;
	wavePromise: Promise<"win" | "fail" | undefined>;
};

/**
 * Orchestrates game initialization, input, rendering, and round timing.
 */
export class GameProcess {
	#logger: Logger;
	#waveProcess?: WaveProcess;
	#debug: boolean;
	#playerControls: PlayerControl[] = [];

	constructor(debug: boolean) {
		this.#debug = debug;
		this.#logger = defaultLogger.child({
			component: "GameProcess",
			debug,
		});
	}

	/**
	 * Initializes Pixi, creates player, starts input & ticker, and begins the round.
	 * Resolves when the round ends.
	 */
	start(
		players: Player[],
		playerControls: PlayerControl[],
		difficulty: Difficulty,
		duration: number,
	) {
		this.#logger.info({ difficulty, players, duration }, "starting the game");

		// Initial game state
		waveState.value = createInitialState(
			players,
			classicMapSize,
			difficulty,
			1,
			duration,
		);

		return this.startWave(playerControls);
	}

	startWave(playerControls: PlayerControl[]): WavePromises {
		this.#playerControls = playerControls;
		return this.#startWaveProcess();
	}

	async startNextWave(state: WaveState) {
		if (!waveState.value) {
			this.#logger.error("no state set to start next wave");
			throw new Error("No state set for the game");
		}
		const tickEvent = withEventMeta({ type: "tick" }, deltaTime(0), nowTime(0));
		waveState.value = nextWave(
			state,
			tickEvent as Extract<GameEvent, { type: "tick" }>,
		);
		this.#logger.info({ state: waveState.value }, "starting the next wave");
		return this.#startWaveProcess();
	}

	#startWaveProcess() {
		this.#waveProcess = new WaveProcess(
			this.#logger,
			this.#playerControls,
			currentGameCanvas,
			this.#debug,
		);
		const waveInitPromise = this.#waveProcess.init();
		const wavePromise = waveInitPromise.then(() => this.#waveProcess?.start());
		return {
			waveInitPromise,
			wavePromise,
		};
	}

	get gameCanvas() {
		return this.#waveProcess?.gameCanvas;
	}
}
