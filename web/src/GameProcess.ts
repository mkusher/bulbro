import * as PIXI from "pixi.js";
import type { Logger } from "pino";
import { logger as defaultLogger } from "./logger";
import type { Bulbro } from "./bulbro";
import {
	createInitialState,
	currentState,
	nextWave,
	type CurrentState,
} from "./currentState";
import { Scene } from "./graphics/Scene";
import { createPlayer } from "./player";
import { mapScale, type Difficulty } from "./game-formulas";
import { WaveProcess } from "./WaveProcess";
import { type Weapon } from "./weapon";
import type { SpriteType } from "./bulbro/Sprite";
import { canvasSize, mapSize, playingFieldSize } from "./game-canvas";
import { v4 } from "uuid";

export type CharacterSetup = {
	bulbro: Bulbro;
	sprite: SpriteType;
};

/**
 * Orchestrates game initialization, input, rendering, and round timing.
 */
export class GameProcess {
	#logger: Logger;
	#app: PIXI.Application;
	#scene!: Scene;
	#waveProcess?: WaveProcess;
	#debug: boolean;

	constructor(debug: boolean) {
		this.#app = new PIXI.Application();
		this.#debug = debug;
		this.#logger = defaultLogger.child({
			component: "GameProcess",
			debug,
		});
	}

	get #canvasSize() {
		return canvasSize.value;
	}

	get #playingFieldSize() {
		return playingFieldSize.value;
	}

	get #mapSize() {
		return mapSize.value;
	}

	async initMap() {
		await this.#app.init({
			backgroundColor: 0x111,
			sharedTicker: true,
			width: this.#canvasSize.width,
			height: this.#canvasSize.height,
		});
	}

	showMap(rootEl: HTMLElement) {
		rootEl.appendChild(this.#app.view);
		canvasSize.value = {
			width: rootEl.offsetWidth,
			height: rootEl.offsetHeight,
		};
	}

	/**
	 * Initializes Pixi, creates player, starts input & ticker, and begins the round.
	 * Resolves when the round ends.
	 */
	async start(
		characters: CharacterSetup[],
		weapons: Weapon[][],
		difficulty: Difficulty,
		duration: number,
	) {
		this.#logger.info(
			{ difficulty, characters, weapons, duration },
			"starting the game",
		);

		// Initial game state
		currentState.value = createInitialState(
			characters.map((character, i) =>
				createPlayer(v4(), character.bulbro, character.sprite, weapons[i]),
			),
			this.#mapSize,
			difficulty,
			1,
			duration,
		);
		this.#scene = new Scene(
			this.#logger,
			this.#debug,
			this.#app,
			mapScale(this.#mapSize, this.#playingFieldSize),
		);
		this.#waveProcess = new WaveProcess(
			this.#logger,
			this.#scene,
			this.#app.ticker,
			this.#debug,
		);
		return {
			wavePromise: this.#waveProcess.start(),
		};
	}

	async startNextWave(state: CurrentState) {
		if (!currentState.value) {
			this.#logger.error("no state set to start next wave");
			throw new Error("No state set for the game");
		}
		currentState.value = nextWave(state, { now: Date.now(), deltaTime: 0 });
		this.#logger.info({ state: currentState.value }, "starting the next wave");
		this.#app.ticker.start();
		this.#waveProcess = new WaveProcess(
			this.#logger,
			this.#scene,
			this.#app.ticker,
			this.#debug,
		);
		return {
			wavePromise: this.#waveProcess.start(),
		};
	}
}
