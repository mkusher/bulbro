import * as PIXI from "pixi.js";
import type { WaveState } from "../waveState";
import type { Logger } from "pino";
import { TimerSprite } from "./TimerSprite";
import { WaveSprite } from "./WaveSprite";
import { InWaveStats } from "../bulbro/sprites/InWaveStats";
import { canvasSize } from "../game-canvas";
import { Scene } from "./Scene";
import type { AutoCenterOnPlayerCamera } from "./AutoCenterOnPlayerCamera";
import type { DeltaTime, NowTime } from "@/time";
import { deltaTime, nowTime } from "@/time";

export class StorybookSceneWithUi {
	#scene: Scene;
	#timerSprite!: TimerSprite;
	#waveSprite!: WaveSprite;
	#inWaveStats: Map<string, InWaveStats> = new Map();
	#uiLayer: PIXI.RenderLayer;
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

		this.#uiLayer = new PIXI.RenderLayer();
		this.#camera.stage.addChild(this.#uiLayer);

		this.#timerSprite = new TimerSprite();
		this.#timerSprite.appendTo(this.#camera.ui, this.#uiLayer);

		this.#waveSprite = new WaveSprite();
		this.#waveSprite.appendTo(this.#camera.ui, this.#uiLayer);
	}

	async init(state: WaveState) {
		this.#logger.info(
			{
				canvasSize: canvasSize.value,
				state,
			},
			"StorybookSceneWithUi init",
		);
		await this.#scene.init(state);
		this.update(deltaTime(0), nowTime(0), state);
	}

	update(deltaTime: DeltaTime, now: NowTime, state: WaveState): void {
		this.#scene.update(deltaTime, now, state);

		this.#timerSprite.update(state.round, canvasSize.value.width);
		this.#waveSprite.update(state.round, canvasSize.value.width);
		this.#updatePlayerStats(deltaTime, state);
	}

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

	#updatePlayerStats(_deltaTime: DeltaTime, state: WaveState) {
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
