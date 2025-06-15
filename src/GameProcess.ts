import * as PIXI from "pixi.js";
import type { Logger } from "pino";
import { logger as defaultLogger } from "./logger";
import type { Bulbro } from "./bulbro";
import { createInitialState, type CurrentState } from "./currentState";
import { Scene } from "./graphics/Scene";
import { TickProcess } from "./TickProcess";
import {
	keysToDirection,
	subscribeToKeyboard,
	type ArrowKeys,
} from "./controls/keyboard";
import { createPlayer } from "./player";
import {
	subscribeToTouch,
	type DirectionContainer,
} from "./controls/touchscreen";

/**
 * Orchestrates game initialization, input, rendering, and round timing.
 */
export class GameProcess {
	#bulbro: Bulbro;
	#logger: Logger;
	#app: PIXI.Application;
	#keys: ArrowKeys = {};
	#touch: DirectionContainer = {};
	#scene!: Scene;
	#state: CurrentState;

	constructor(bulbro: Bulbro) {
		this.#app = new PIXI.Application();
		this.#bulbro = bulbro;
		this.#logger = defaultLogger.child({
			component: "GameProcess",
			playerId: bulbro.id,
		});
		this.#state = createInitialState(createPlayer(bulbro), {
			width: 0,
			height: 0,
		});
	}

	/**
	 * Initializes Pixi, creates player, starts input & ticker, and begins the round.
	 * Resolves when the round ends.
	 */
	async start(): Promise<void> {
		const mapSize = { width: 800, height: 600 };
		await this.#app.init({ ...mapSize, backgroundColor: 0x1099bb });
		document.body.appendChild(this.#app.view);

		subscribeToKeyboard(this.#keys);
		subscribeToTouch(this.#touch);

		// Initial game state
		this.#state = createInitialState(createPlayer(this.#bulbro), mapSize);
		// Start round
		this.#logger.info({ state: this.#state }, "GameProcess is starting");

		// Setup scene
		this.#scene = new Scene(this.#app);
		await this.#scene.init(this.#state);
		let i = 0;
		this.#app.ticker.add(() => {
			++i;
			const now = Date.now();
			const delta = this.#app.ticker.deltaMS / 1000;
			if (i % 200 === 0) {
				this.#logger.info({ state: this.#state, i }, "Current state");
			}
			// Delegate per-tick updates to TickProcess
			const tickProc = new TickProcess(this.#logger, this.#scene);
			const keyboardDirection = keysToDirection(this.#keys);
			const touchDirection = this.#touch.direction;
			this.#state = tickProc.tick(
				this.#state,
				delta,
				touchDirection ?? keyboardDirection,
				now,
			);
		});
	}
}
