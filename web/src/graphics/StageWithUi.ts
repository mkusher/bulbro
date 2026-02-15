import type { Logger } from "pino";
import * as PIXI from "pixi.js";
import type { GameEvent } from "@/game-events/GameEvents";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { InWaveStats } from "../bulbro/sprites/InWaveStats";
import { canvasSize } from "../game-canvas";
import type { WaveState } from "../waveState";
import type { Camera } from "./Camera";
import { HitIndicators } from "./HitIndicators";
import { Scene } from "./Scene";
import { TimerSprite } from "./TimerSprite";
import { WaveSprite } from "./WaveSprite";

/**
 * Decorator that adds UI elements (timer, wave number, health bars) to a Scene.
 */
export class StageWithUi {
	#scene: Scene;
	#timerSprite!: TimerSprite;
	#waveSprite!: WaveSprite;
	#inWaveStats: Map<
		string,
		InWaveStats
	> =
		new Map();
	#uiLayer: PIXI.RenderLayer;
	#camera: Camera;
	#logger: Logger;
	#hitIndicators: HitIndicators;

	constructor(
		logger: Logger,
		debug: boolean,
		camera: Camera,
		scale: number,
	) {
		this.#logger =
			logger;
		this.#camera =
			camera;
		this.#scene =
			new Scene(
				logger,
				debug,
				camera,
				scale,
			);

		// Create UI layer and sprites
		this.#uiLayer =
			new PIXI.RenderLayer();
		this.#camera.stage.addChild(
			this
				.#uiLayer,
		);

		this.#timerSprite =
			new TimerSprite();
		this.#timerSprite.appendTo(
			this
				.#camera
				.ui,
			this
				.#uiLayer,
		);

		this.#waveSprite =
			new WaveSprite();
		this.#waveSprite.appendTo(
			this
				.#camera
				.ui,
			this
				.#uiLayer,
		);

		this.#hitIndicators =
			new HitIndicators();
		this.#hitIndicators.appendTo(
			this
				.playingFieldContainer,
			this
				.#uiLayer,
		);
	}

	/**
	 * Initializes both scene and UI elements.
	 */
	async init(
		state: WaveState,
	) {
		this.#logger.info(
			{
				canvasSize:
					canvasSize.value,
				state,
			},
			"StageWithUi init",
		);
		await this.#scene.init(
			state,
		);
		this.update(
			deltaTime(
				0,
			),
			nowTime(
				0,
			),
			state,
			[],
		);
	}

	/**
	 * Updates both scene and UI elements each frame.
	 */
	update(
		deltaTime: DeltaTime,
		now: NowTime,
		state: WaveState,
		events: GameEvent[],
	): void {
		// Update scene (players, enemies, shots, objects)
		this.#scene.update(
			deltaTime,
			now,
			state,
		);

		// Update UI elements
		this.#timerSprite.update(
			state.round,
			canvasSize
				.value
				.width,
		);
		this.#waveSprite.update(
			state.round,
			canvasSize
				.value
				.width,
		);
		this.#updatePlayerStats(
			deltaTime,
			state,
		);
		this.#hitIndicators.update(
			deltaTime,
			events,
			state,
		);
	}

	// Expose scene properties for backward compatibility
	get playingFieldContainer() {
		return this
			.#scene
			.playingFieldContainer;
	}

	get playingFieldLayer() {
		return this
			.#scene
			.playingFieldLayer;
	}

	get groundLayer() {
		return this
			.#scene
			.groundLayer;
	}

	get camera() {
		return this
			.#scene
			.camera;
	}

	#updatePlayerStats(
		deltaTime: DeltaTime,
		state: WaveState,
	) {
		state.players.forEach(
			(
				player,
				i,
			) => {
				if (
					!this.#inWaveStats.get(
						player.id,
					)
				) {
					const sprite =
						new InWaveStats(
							canvasSize.value,
							i,
						);
					sprite.appendTo(
						this
							.#camera
							.ui,
						this
							.#uiLayer,
					);
					this.#inWaveStats.set(
						player.id,
						sprite,
					);
				}
				this.#inWaveStats
					.get(
						player.id,
					)
					?.update(
						canvasSize.value,
						player,
					);
			},
		);
	}
}
