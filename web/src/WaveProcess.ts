import type { Logger } from "pino";
import { currentState } from "./currentState";
import { StageWithUi } from "./graphics/StageWithUi";
import { TickProcess } from "./TickProcess";
import { type PlayerControl } from "./controls";
import { canvasSize, scale } from "./game-canvas";
import { AutoCenterOnPlayerCamera } from "./graphics/AutoCenterOnPlayerCamera";

export class WaveProcess {
	#logger: Logger;
	#scene: StageWithUi;
	#tickIndex = 0;
	#resolvers = Promise.withResolvers<"win" | "fail">();
	#debug: boolean;
	#playerControls: PlayerControl[];
	#camera: AutoCenterOnPlayerCamera;

	constructor(
		baseLogger: Logger,
		playerControls: PlayerControl[],
		debug: boolean,
	) {
		this.#logger = baseLogger.child({
			component: "WaveProcess",
		});
		this.#debug = debug;
		this.#camera = new AutoCenterOnPlayerCamera();
		this.#scene = new StageWithUi(
			this.#logger,
			this.#debug,
			this.#camera,
			scale.value,
		);
		this.#playerControls = playerControls;
	}

	get gameCanvas() {
		return this.#camera.canvas;
	}

	get #ticker() {
		return this.#camera.ticker;
	}

	async init() {
		await this.#camera.init(canvasSize.value);
		await this.#scene.init(currentState.value);
	}

	async start() {
		await Promise.all(this.#playerControls.map((c) => c.start()));
		this.#ticker.add(this.#tick);
		this.#ticker.start();
		return this.#resolvers.promise;
	}

	async stop(type: "win" | "fail") {
		this.#ticker.stop();
		this.#ticker.remove(this.#tick);

		this.#resolvers.resolve(type);
		await Promise.all(this.#playerControls.map((c) => c.stop()));
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
			this.#playerControls.map((c) => c.direction),
			now,
		);
	};
}
