import * as PIXI from "pixi.js";
import type { Logger } from "pino";
import { logger as defaultLogger } from "./logger";
import type { Bulbro } from "./bulbro";
import {
	createInitialState,
	nextWave,
	type CurrentState,
} from "./currentState";
import { Scene } from "./graphics/Scene";
import { createPlayer } from "./player";
import {
	subscribeToTouch,
	type DirectionContainer,
} from "./controls/touchscreen";
import type { Size } from "./geometry";
import type { Difficulty } from "./game-formulas";
import { WaveProcess } from "./WaveProcess";
import { toWeaponState, type Weapon } from "./weapon";

/**
 * Orchestrates game initialization, input, rendering, and round timing.
 */
export class GameProcess {
	#logger: Logger;
	#app: PIXI.Application;
	#scene!: Scene;
	#mapSize: Size;
	#state?: CurrentState;
	#waveProcess?: WaveProcess;

	constructor() {
		this.#app = new PIXI.Application();
		this.#logger = defaultLogger.child({
			component: "GameProcess",
		});
		this.#mapSize = { width: 800, height: 600 };
	}

	async initMap(mapSize = this.#mapSize) {
		await this.#app.init({ ...mapSize, backgroundColor: 0x1099bb });
	}

	showMap(rootEl: HTMLElement) {
		rootEl.appendChild(this.#app.view);
	}

	/**
	 * Initializes Pixi, creates player, starts input & ticker, and begins the round.
	 * Resolves when the round ends.
	 */
	async start(bulbro: Bulbro, weapons: Weapon[], difficulty: Difficulty) {
		this.#logger.info({ difficulty, bulbro, weapons }, "starting the game");

		// Initial game state
		this.#state = createInitialState(
			createPlayer(bulbro, weapons),
			this.#mapSize,
			difficulty,
		);
		this.#scene = new Scene(this.#app);
		this.#waveProcess = new WaveProcess(
			this.#logger,
			this.#state,
			this.#scene,
			this.#app.ticker,
		);
		return {
			wavePromise: this.#waveProcess.start(),
		};
	}

	async startNextWave(weapons: Weapon[]) {
		if (!this.#state) {
			this.#logger.error("no state set to start next wave");
			throw new Error("No state set for the game");
		}
		this.#state = nextWave(this.#state, weapons.map(toWeaponState));
		this.#logger.info(
			{ weapons, state: this.#state },
			"starting the next wave",
		);
		this.#app.ticker.start();
		this.#waveProcess = new WaveProcess(
			this.#logger,
			this.#state,
			this.#scene,
			this.#app.ticker,
		);
		return {
			wavePromise: this.#waveProcess.start(),
		};
	}
}
