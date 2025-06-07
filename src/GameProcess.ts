import * as PIXI from "pixi.js";
import type { Logger } from "pino";
import { logger as defaultLogger } from "./logger";
import type { Bulbro } from "./bulbro";
import { createInitialState, type CurrentState } from "./currentState";
import { RoundProcess } from "./RoundProcess";
import { Scene } from "./graphics/Scene";
import { TickProcess } from "./TickProcess";
import { subscribeToKeyboard, type ArrowKeys } from "./keyboard";
import { v4 } from "uuid";

/**
 * Orchestrates game initialization, input, rendering, and round timing.
 */
export class GameProcess {
	#bulbro: Bulbro;
	#logger: Logger;
	#app: PIXI.Application;
	#keys: ArrowKeys = {};
	#scene!: Scene;
	#roundProcess?: RoundProcess;
	#state: CurrentState;

	constructor(bulbro: Bulbro) {
		this.#app = new PIXI.Application();
		this.#bulbro = bulbro;
		this.#logger = defaultLogger.child({
			component: "GameProcess",
			playerId: bulbro.id,
		});
		this.#state = createInitialState(
			{
				id: v4(),
				bulbro: this.#bulbro,
			},
			{
				width: 0,
				height: 0,
			},
		);
	}

	/**
	 * Initializes Pixi, creates player, starts input & ticker, and begins the round.
	 * Resolves when the round ends.
	 */
	async start(): Promise<void> {
		const mapSize = { width: 800, height: 600 };
		await this.#app.init({ ...mapSize, backgroundColor: 0x1099bb });
		document.body.appendChild(this.#app.view);

		this.#keys = {};
		subscribeToKeyboard(this.#keys);

		// Initial game state
		this.#state = createInitialState(
			{
				id: v4(),
				bulbro: this.#bulbro,
			},
			mapSize,
		);
		// Start round
		this.#logger.info({ state: this.#state }, "GameProcess is starting");

		const round = {
			id: "round1",
			duration: 60_000,
			players: [{ id: this.#bulbro.id, bulbro: this.#bulbro }],
		};
		this.#roundProcess = new RoundProcess(round);
		this.#roundProcess.start();

		// Setup scene
		this.#scene = new Scene(this.#app, this.#bulbro, this.#roundProcess);
		this.#scene.init(this.#state);
		let i = 0;
		let lastTick: TickProcess;
		this.#app.ticker.add(() => {
			++i;
			const now = Date.now();
			const delta = this.#app.ticker.deltaMS / 1000;
			if (i % 200 === 0) {
				this.#logger.info({ state: this.#state, i }, "Tick");
			}
			// Delegate per-tick updates to TickProcess
			const tickProc = new TickProcess(
				this.#scene,
				this.#roundProcess,
				lastTick,
			);
			this.#state = tickProc.tick(this.#state, delta, this.#keys, now);
			lastTick = tickProc;
		});
		return this.#roundProcess.wait();
	}
}
