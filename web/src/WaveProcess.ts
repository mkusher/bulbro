import type { Logger } from "pino";
import { currentState } from "./currentState";
import { StageWithUi } from "./graphics/StageWithUi";
import { TickProcess } from "./TickProcess";
import { type PlayerControl } from "./controls";
import { canvasSize, scale } from "./game-canvas";
import { AutoCenterOnPlayerCamera } from "./graphics/AutoCenterOnPlayerCamera";
import { InMemoryGameEventQueue } from "./game-events/GameEventQueue";

export class WaveProcess {
	#logger: Logger;
	#scene: StageWithUi;
	#tickIndex = 0;
	#resolvers = Promise.withResolvers<"win" | "fail">();
	#debug: boolean;
	#playerControls: PlayerControl[];
	#camera: AutoCenterOnPlayerCamera;
	#eventQueue: InMemoryGameEventQueue;
	#tickProcess: TickProcess;
	#startedAt: number = 0;

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
		this.#eventQueue = new InMemoryGameEventQueue();
		this.#tickProcess = new TickProcess(
			this.#logger,
			this.#scene,
			this.#playerControls,
			this.#eventQueue,
			this.#debug,
		);
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
		return this;
	}

	async start() {
		await Promise.all(this.#playerControls.map((c) => c.start()));
		this.#ticker.add(this.tick);
		this.#ticker.start();
		this.#startedAt = performance.now();
		return this.#resolvers.promise;
	}

	now() {
		return performance.now() - this.#startedAt;
	}

	async stop(type: "win" | "fail") {
		this.#ticker.stop();
		this.#ticker.remove(this.tick);

		this.#resolvers.resolve(type);
		await Promise.all(this.#playerControls.map((c) => c.stop()));
		return this.#resolvers.promise;
	}

	tick = () => {
		const i = this.#tickIndex++;
		const now = this.now();
		const delta = this.#ticker.deltaMS;
		const state = currentState.value;
		if (!state) {
			this.#logger.warn({ i }, "No current state set");
			return;
		}
		if (!state.round.isRunning) {
			this.#logger.info({ state, delta, now }, "Stop wave");
			this.stop(
				state.players.filter((player) => player.healthPoints > 0).length > 0
					? "win"
					: "fail",
			);
		}
		if (i % 500 === 0) {
			this.#logger.info({ state, i }, "Current state");
		}
		// Delegate per-tick updates to TickProcess and get events for network sync
		currentState.value = this.#tickProcess.tick(state, delta, now);
	};

	get eventQueue() {
		return this.#eventQueue;
	}
}
