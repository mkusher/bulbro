import type { Logger } from "pino";
import { logger as defaultLogger } from "./logger";
import type { Bulbro } from "./bulbro";
import {
	createInitialState,
	currentState,
	nextWave,
	type CurrentState,
} from "./currentState";
import { type Player } from "./player";
import { type Difficulty } from "./game-formulas";
import { WaveProcess } from "./WaveProcess";
import type { SpriteType } from "./bulbro/Sprite";
import { classicMapSize } from "./game-canvas";
import type { PlayerControl } from "./controls";

export type CharacterSetup = {
	bulbro: Bulbro;
	sprite: SpriteType;
};

export type WavePromises = {
	waveInitPromise: Promise<void>;
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
		currentState.value = createInitialState(
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
		this.#waveProcess = new WaveProcess(
			this.#logger,
			this.#playerControls,
			this.#debug,
		);
		const waveInitPromise = this.#waveProcess.init();
		const wavePromise = waveInitPromise.then(() => this.#waveProcess?.start());
		return {
			waveInitPromise,
			wavePromise,
		};
	}

	async startNextWave(state: CurrentState) {
		if (!currentState.value) {
			this.#logger.error("no state set to start next wave");
			throw new Error("No state set for the game");
		}
		currentState.value = nextWave(state, { now: Date.now(), deltaTime: 0 });
		this.#logger.info({ state: currentState.value }, "starting the next wave");
		this.#waveProcess = new WaveProcess(
			this.#logger,
			this.#playerControls,
			this.#debug,
		);
		return {
			wavePromise: this.#waveProcess.start(),
		};
	}

	get gameCanvas() {
		return this.#waveProcess?.gameCanvas;
	}
}
