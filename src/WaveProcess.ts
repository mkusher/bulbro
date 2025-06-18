import type { Logger } from "pino";
import type { CurrentState } from "./currentState";
import type { Scene } from "./graphics/Scene";
import type { Ticker } from "pixi.js";
import { TickProcess } from "./TickProcess";
import {
	keysToDirection,
	subscribeToKeyboard,
	type ArrowKeys,
} from "./controls/keyboard";
import {
	subscribeToTouch,
	type DirectionContainer,
} from "./controls/touchscreen";

export class WaveProcess {
	#logger: Logger;
	#state: CurrentState;
	#scene: Scene;
	#ticker: Ticker;
	#keys: ArrowKeys = {};
	#touch: DirectionContainer = {};
	#tickIndex = 0;
	#resolvers = Promise.withResolvers<"win" | "fail">();
	#debug: boolean;

	constructor(
		baseLogger: Logger,
		initialState: CurrentState,
		scene: Scene,
		ticker: Ticker,
		debug: boolean,
	) {
		this.#logger = baseLogger.child({
			component: "WaveProcess",
		});
		this.#state = initialState;
		this.#scene = scene;
		this.#ticker = ticker;
		this.#debug = debug;
	}

	async start() {
		subscribeToKeyboard(this.#keys);
		subscribeToTouch(this.#touch);
		await this.#scene.init(this.#state);
		this.#ticker.add(this.#tick);
		this.#ticker.start();
		return this.#resolvers.promise;
	}

	async stop(type: "win" | "fail") {
		this.#ticker.stop();
		this.#ticker.remove(this.#tick);

		this.#resolvers.resolve(type);
		return this.#resolvers.promise;
	}

	#tick = () => {
		const i = this.#tickIndex++;
		const now = Date.now();
		const delta = this.#ticker.deltaMS / 1000;
		const state = this.#state;
		if (!this.#state?.round.isRunning) {
			this.#logger.info({ state }, "Stop wave");
			this.stop(
				this.#state.players.filter((player) => player.healthPoints > 0).length >
					0
					? "win"
					: "fail",
			);
		}
		if (i % 500 === 0) {
			this.#logger.info({ state, i }, "Current state");
		}
		if (!state) {
			this.#logger.warn({ i }, "No current state set");
			return;
		}
		// Delegate per-tick updates to TickProcess
		const tickProc = new TickProcess(this.#logger, this.#scene);
		const keyboardDirection = keysToDirection(this.#keys);
		const touchDirection = this.#touch.direction;
		this.#state = tickProc.tick(
			state,
			delta,
			touchDirection ?? keyboardDirection,
			now,
		);
	};
}
