import * as PIXI from "pixi.js";
import type { Position, Size } from "@/geometry";
import { canvasSize, computedMapSizeForWindow } from "@/game-canvas";

export class Camera {
	#app: PIXI.Application;
	#stage: PIXI.Container;
	#isInitialized = false;

	constructor() {
		this.#app = new PIXI.Application();
		this.#stage = new PIXI.Container();
		this.#app.stage.addChild(this.#stage);
	}

	async init(size: Size) {
		await this.#app.init({
			backgroundColor: 0x222222,
			sharedTicker: true,
			width: size.width,
			height: size.height,
		});
		this.#isInitialized = true;
	}

	get stage() {
		return this.#stage;
	}

	get ui() {
		return this.#app.stage;
	}

	get ticker() {
		return this.#app.ticker;
	}

	get canvas() {
		if (this.#isInitialized) {
			return this.#app.canvas;
		}
	}

	update(playerPosition: Position) {
		this.#moveCamera(playerPosition);
	}

	zoom(scale: number) {
		this.#stage.scale = scale;
	}

	#moveCamera(playerPosition: Position) {
		if (!this.#isSmallScreen(computedMapSizeForWindow.value, canvasSize.value)) {
			this.#moveToCenter();
			return;
		}
    const scale = this.#stage.scale.x
		const position = {
			x: playerPosition.x * scale,
			y: playerPosition.y * scale,
		};

		this.#stage.x = -position.x + canvasSize.value.width / 2;
		this.#stage.y = -position.y + canvasSize.value.height / 2;
	}

	#isSmallScreen(playingFieldSize: Size, canvasSize: Size) {
		return (
			playingFieldSize.width > canvasSize.width ||
			playingFieldSize.height > canvasSize.height
		);
	}

	#moveToCenter() {
		this.#stage.x = (canvasSize.value.width - computedMapSizeForWindow.value.width) / 2;
		this.#stage.y = (canvasSize.value.height - computedMapSizeForWindow.value.height) / 2;
	}
}
