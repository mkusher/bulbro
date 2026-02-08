import type { Signal } from "@preact/signals";
import type { Logger } from "pino";
import {
	audioEngine,
	bgmEnabled,
	setFullBgmVolume,
	setQuietBgmVolume,
} from "./audio";
import type { PlayerControl } from "./controls";
import { DurationTracker } from "./DurationTracker";
import {
	canvasSize,
	scale,
} from "./game-canvas";
import { InMemoryGameEventQueue } from "./game-events/GameEventQueue";
import { AutoCenterOnPlayerCamera } from "./graphics/AutoCenterOnPlayerCamera";
import { StageWithUi } from "./graphics/StageWithUi";
import { TickProcess } from "./TickProcess";
import { deltaTime } from "./time";
import { waveState } from "./waveState";

export class WaveProcess {
	#logger: Logger;
	#scene: StageWithUi;
	#tickIndex = 0;
	#resolvers =
		Promise.withResolvers<
			| "win"
			| "fail"
		>();
	#debug: boolean;
	#playerControls: PlayerControl[];
	#camera: AutoCenterOnPlayerCamera;
	#eventQueue: InMemoryGameEventQueue;
	#tickProcess: TickProcess;
	#durationTracker =
		new DurationTracker();
	#gameCanvasSignal: Signal<
		| HTMLCanvasElement
		| undefined
	>;

	constructor(
		baseLogger: Logger,
		playerControls: PlayerControl[],
		gameCanvasSignal: Signal<
			| HTMLCanvasElement
			| undefined
		>,
		debug: boolean,
	) {
		this.#logger =
			baseLogger.child(
				{
					component:
						"WaveProcess",
				},
			);
		this.#debug =
			debug;
		this.#gameCanvasSignal =
			gameCanvasSignal;
		this.#camera =
			new AutoCenterOnPlayerCamera();
		this.#scene =
			new StageWithUi(
				this
					.#logger,
				this
					.#debug,
				this
					.#camera,
				scale.value,
			);
		this.#playerControls =
			playerControls;
		this.#eventQueue =
			new InMemoryGameEventQueue();
		this.#tickProcess =
			new TickProcess(
				this
					.#logger,
				this
					.#scene,
				this
					.#playerControls,
				this
					.#eventQueue,
				waveState,
				this
					.#debug,
			);
	}

	get gameCanvas() {
		return this
			.#gameCanvasSignal
			.value;
	}

	get #ticker() {
		return this
			.#camera
			.ticker;
	}

	async init() {
		await this.#camera.init(
			canvasSize.value,
		);
		await this.#scene.init(
			waveState.value,
		);
		this.#gameCanvasSignal.value =
			this.#camera.canvas;
		return this;
	}

	async start() {
		// Set full volume for in-game
		setFullBgmVolume();

		// Start BGM if enabled
		if (
			bgmEnabled.value
		) {
			audioEngine.playBgm();
		}

		await Promise.all(
			this.#playerControls.map(
				(
					c,
				) =>
					c.start(),
			),
		);
		this.#ticker.add(
			this
				.tick,
		);
		this.#ticker.start();
		this.#durationTracker.start();
		return this
			.#resolvers
			.promise;
	}

	now() {
		return this.#durationTracker.length();
	}

	async stop(
		type:
			| "win"
			| "fail",
	) {
		// Reduce BGM volume for menus (BGM continues playing)
		setQuietBgmVolume();

		this.#ticker.stop();
		this.#ticker.remove(
			this
				.tick,
		);

		this.#resolvers.resolve(
			type,
		);
		await Promise.all(
			this.#playerControls.map(
				(
					c,
				) =>
					c.stop(),
			),
		);
		return this
			.#resolvers
			.promise;
	}

	tick =
		() => {
			const i =
				this
					.#tickIndex++;
			const now =
				this.now();
			const delta =
				deltaTime(
					this
						.#ticker
						.deltaMS,
				);
			const state =
				waveState.value;
			if (
				!state
			) {
				this.#logger.warn(
					{
						i,
					},
					"No current state set",
				);
				return;
			}
			if (
				!state
					.round
					.isRunning
			) {
				this.#logger.info(
					{
						state,
						delta,
						now,
					},
					"Stop wave",
				);
				this.stop(
					state.players.filter(
						(
							player,
						) =>
							player.healthPoints >
							0,
					)
						.length >
						0
						? "win"
						: "fail",
				);
			}
			if (
				i %
					500 ===
				0
			) {
				this.#logger.info(
					{
						state,
						i,
					},
					"Current state",
				);
			}
			// Delegate per-tick updates to TickProcess and get events for network sync
			waveState.value =
				this.#tickProcess.tick(
					state,
					delta,
					now,
				);
		};

	get eventQueue() {
		return this
			.#eventQueue;
	}
}
