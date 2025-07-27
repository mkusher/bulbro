import * as PIXI from "pixi.js";
import type { CurrentState } from "../currentState";
import type { Logger } from "pino";
import { TimerSprite } from "./TimerSprite";
import { WaveSprite } from "./WaveSprite";
import { InWaveStats } from "../bulbro/sprites/InWaveStats";
import { canvasSize } from "../game-canvas";
import { Scene } from "./Scene";
import type { AutoCenterOnPlayerCamera } from "./AutoCenterOnPlayerCamera";

/**
 * Decorator that adds UI elements (timer, wave number, health bars) to a Scene.
 */
export class StageWithUi {
	#scene: Scene;
	#timerSprite!: TimerSprite;
	#waveSprite!: WaveSprite;
	#inWaveStats: Map<string, InWaveStats> = new Map();
	#uiLayer: PIXI.IRenderLayer;
	#camera: AutoCenterOnPlayerCamera;
	#logger: Logger;

	constructor(
		logger: Logger,
		debug: boolean,
		camera: AutoCenterOnPlayerCamera,
		scale: number,
	) {
		this.#logger = logger;
		this.#camera = camera;
		this.#scene = new Scene(logger, debug, camera, scale);

		// Create UI layer and sprites
		this.#uiLayer = new PIXI.RenderLayer();
		this.#camera.stage.addChild(this.#uiLayer);

		this.#timerSprite = new TimerSprite();
		this.#timerSprite.appendTo(this.#camera.ui, this.#uiLayer);

		this.#waveSprite = new WaveSprite();
		this.#waveSprite.appendTo(this.#camera.ui, this.#uiLayer);
	}

	/**
	 * Initializes both scene and UI elements.
	 */
	async init(state: CurrentState) {
		this.#logger.info(
			{
				canvasSize: canvasSize.value,
				state,
			},
			"StageWithUi init",
		);
		await this.#scene.init(state);
		this.update(0, state);
	}

	/**
	 * Updates both scene and UI elements each frame.
	 */
	update(deltaTime: number, state: CurrentState): void {
		// Update scene (players, enemies, shots, objects)
		this.#scene.update(deltaTime, state);

		// Update UI elements
		this.#timerSprite.update(state.round, canvasSize.value.width);
		this.#waveSprite.update(state.round, canvasSize.value.width);
		this.#updatePlayerStats(deltaTime, state);
	}

	// Expose scene properties for backward compatibility
	get playingFieldContainer() {
		return this.#scene.playingFieldContainer;
	}

	get playingFieldLayer() {
		return this.#scene.playingFieldLayer;
	}

	get groundLayer() {
		return this.#scene.groundLayer;
	}

	get camera() {
		return this.#scene.camera;
	}

	#updatePlayerStats(deltaTime: number, state: CurrentState) {
		state.players.forEach((player, i) => {
			if (!this.#inWaveStats.get(player.id)) {
				const sprite = new InWaveStats(canvasSize.value, i);
				sprite.appendTo(this.#camera.ui, this.#uiLayer);
				this.#inWaveStats.set(player.id, sprite);
			}
			this.#inWaveStats.get(player.id)?.update(canvasSize.value, player);
		});
	}
}
