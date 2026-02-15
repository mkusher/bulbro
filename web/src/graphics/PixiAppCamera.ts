import * as PIXI from "pixi.js";
import { canvasSize } from "@/game-canvas";
import type {
	Position,
	Size,
} from "@/geometry";
import type { WaveState } from "@/waveState";
import { createPixiInitOptions } from "./PixiConfiguration";
import type { Camera } from "./Camera";

export class PixiAppCamera
	implements
		Camera
{
	#app: PIXI.Application;
	#stage: PIXI.Container;
	#isInitialized = false;

	constructor() {
		this.#app =
			new PIXI.Application();
		this.#stage =
			new PIXI.Container();
		this.#app.stage.addChild(
			this
				.#stage,
		);
	}

	async init(
		size: Size,
	) {
		await this.#app.init(
			createPixiInitOptions(
				{
					backgroundColor: 0x222222,
					sharedTicker: true,
					width:
						size.width,
					height:
						size.height,
				},
			),
		);
		this.#isInitialized = true;
	}

	get stage() {
		return this
			.#stage;
	}

	get ui() {
		return this
			.#app
			.stage;
	}

	get ticker() {
		return this
			.#app
			.ticker;
	}

	get canvas() {
		if (
			this
				.#isInitialized
		) {
			return this
				.#app
				.canvas;
		}
	}

	zoom(
		scale: number,
	) {
		this.#stage.scale =
			scale;
	}

	update(
		_state: WaveState,
	) {}

	setCenter(
		position: Position,
	) {
		const scale =
			this
				.#stage
				.scale
				.x;
		this.#stage.x =
			-position.x *
				scale +
			canvasSize
				.value
				.width /
				2;
		this.#stage.y =
			-position.y *
				scale +
			canvasSize
				.value
				.height /
				2;
	}
}
