import type { Logger } from "pino";
import { currentState } from "./currentState";
import type { Scene } from "./graphics/Scene";
import type { Ticker } from "pixi.js";
import { TickProcess } from "./TickProcess";
import {
	type PlayerControl,
	MainKeyboardControl,
	MultipleControl,
	touchscreenControl,
	SecondaryKeyboardControl,
} from "./controls";

export class WaveProcess {
	#logger: Logger;
	#scene: Scene;
	#ticker: Ticker;
	#tickIndex = 0;
	#resolvers = Promise.withResolvers<"win" | "fail">();
	#debug: boolean;
	#localPlayerControls: PlayerControl[];

	constructor(
		baseLogger: Logger,
		scene: Scene,
		ticker: Ticker,
		debug: boolean,
	) {
		this.#logger = baseLogger.child({
			component: "WaveProcess",
		});
		this.#scene = scene;
		this.#ticker = ticker;
		this.#debug = debug;
		const players = currentState.value.players;
		this.#localPlayerControls = [
			new MultipleControl([new MainKeyboardControl(), touchscreenControl]),
		];
		if (players.length > 1) {
			this.#localPlayerControls.push(new SecondaryKeyboardControl());
		}
	}

	async start() {
		await this.#scene.init(currentState.value);
		await Promise.all(this.#localPlayerControls.map((c) => c.start()));
		this.#ticker.add(this.#tick);
		this.#ticker.start();
		return this.#resolvers.promise;
	}

	async stop(type: "win" | "fail") {
		this.#ticker.stop();
		this.#ticker.remove(this.#tick);

		this.#resolvers.resolve(type);
		await Promise.all(this.#localPlayerControls.map((c) => c.stop()));
		return this.#resolvers.promise;
	}

	#tick = () => {
		const i = this.#tickIndex++;
		const now = Date.now();
		const delta = this.#ticker.deltaMS / 1000;
		const state = currentState.value;
		if (!state) {
			this.#logger.warn({ i }, "No current state set");
			return;
		}
		if (!state.round.isRunning) {
			this.#logger.info({ state }, "Stop wave");
			this.stop(
				state.players.filter((player) => player.healthPoints > 0).length > 0
					? "win"
					: "fail",
			);
		}
		if (i % 500 === 0) {
			this.#logger.info({ state, i }, "Current state");
		}
		// Delegate per-tick updates to TickProcess
		const tickProc = new TickProcess(this.#logger, this.#scene, this.#debug);
		currentState.value = tickProc.tick(
			state,
			delta,
			this.#localPlayerControls.map((c) => c.getDirection()),
			now,
		);
	};
}
