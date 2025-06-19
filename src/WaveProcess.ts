import type { Logger } from "pino";
import type { CurrentState } from "./currentState";
import type { Scene } from "./graphics/Scene";
import type { Ticker } from "pixi.js";
import { TickProcess } from "./TickProcess";
import {
	type PlayerControl,
	MainKeyboardControl,
	MultipleControl,
	TouchscreenControl,
} from "./controls";
import { SecondaryKeyboardControl } from "./controls/SecondaryKeyboardControl";

export class WaveProcess {
	#logger: Logger;
	#state: CurrentState;
	#scene: Scene;
	#ticker: Ticker;
	#tickIndex = 0;
	#resolvers = Promise.withResolvers<"win" | "fail">();
	#debug: boolean;
	#localPlayerControls: PlayerControl[];

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
		const players = this.#state.players;
		this.#localPlayerControls = [
			new MultipleControl([
				new MainKeyboardControl(),
				new TouchscreenControl(),
			]),
		];
		if (players.length > 1) {
			this.#localPlayerControls.push(new SecondaryKeyboardControl());
		}
	}

	async start() {
		await this.#scene.init(this.#state);
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
		this.#state = tickProc.tick(
			state,
			delta,
			this.#localPlayerControls.map((c) => c.getDirection()),
			now,
		);
	};
}
