import * as PIXI from "pixi.js";
import type { Logger } from "pino";
import { logger as defaultLogger } from "./logger";
import type { Bulbro } from "./bulbro";
import {
	createInitialState,
	nextWave,
	type CurrentState,
	type WeaponState,
} from "./currentState";
import { Scene } from "./graphics/Scene";
import { createPlayer } from "./player";
import type { Size } from "./geometry";
import { mapScale, toClassicExpected, type Difficulty } from "./game-formulas";
import { WaveProcess } from "./WaveProcess";
import { toWeaponState, type Weapon } from "./weapon";
import type { SpriteType } from "./bulbro/Sprite";

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
	#canvasSize: Size;
	#mapSize: Size;
	#state?: CurrentState;
	#waveProcess?: WaveProcess;
	#debug: boolean;

	constructor(debug: boolean) {
		this.#app = new PIXI.Application();
		this.#debug = debug;
		this.#logger = defaultLogger.child({
			component: "GameProcess",
			debug,
		});
		this.#canvasSize = { width: 800, height: 600 };
		this.#mapSize = toClassicExpected(this.#canvasSize);
	}

	async initMap(mapSize = this.#canvasSize) {
		this.#canvasSize = mapSize;
		this.#mapSize = toClassicExpected(this.#canvasSize);
		await this.#app.init({ ...mapSize, backgroundColor: 0x1099bb });
	}

	get currentState() {
		return this.#state;
	}

	showMap(rootEl: HTMLElement) {
		rootEl.appendChild(this.#app.view);
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
		this.#state = createInitialState(
			characters.map((character, i) =>
				createPlayer(character.bulbro, character.sprite, weapons[i]),
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
			mapScale(this.#mapSize, this.#canvasSize),
		);
		this.#waveProcess = new WaveProcess(
			this.#logger,
			this.#state,
			this.#scene,
			this.#app.ticker,
			this.#debug,
		);
		return {
			wavePromise: this.#waveProcess.start(),
		};
	}

	async startNextWave(state: CurrentState) {
		if (!this.#state) {
			this.#logger.error("no state set to start next wave");
			throw new Error("No state set for the game");
		}
		this.#state = nextWave(state, { now: Date.now(), deltaTime: 0 });
		this.#logger.info({ state: this.#state }, "starting the next wave");
		this.#app.ticker.start();
		this.#waveProcess = new WaveProcess(
			this.#logger,
			this.#state,
			this.#scene,
			this.#app.ticker,
			this.#debug,
		);
		return {
			wavePromise: this.#waveProcess.start(),
		};
	}
}
