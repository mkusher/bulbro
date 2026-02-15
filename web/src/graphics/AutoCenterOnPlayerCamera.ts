import {
	canvasSize,
	computedMapSizeForWindow,
} from "@/game-canvas";
import type {
	Position,
	Size,
} from "@/geometry";
import { zeroPoint } from "@/geometry";
import type { WaveState } from "@/waveState";
import type { Camera } from "./Camera";

/**
 * Decorator that adds automatic player centering functionality to a Camera.
 * Centers camera on player position, with map centering fallback for larger screens.
 */
export class AutoCenterOnPlayerCamera
	implements
		Camera
{
	#camera: Camera;

	constructor(
		camera: Camera,
	) {
		this.#camera =
			camera;
	}

	get stage() {
		return this
			.#camera
			.stage;
	}

	get ui() {
		return this
			.#camera
			.ui;
	}

	get ticker() {
		return this
			.#camera
			.ticker;
	}

	get canvas() {
		return this
			.#camera
			.canvas;
	}

	async init(
		size: Size,
	) {
		await this.#camera.init(
			size,
		);
	}

	zoom(
		scale: number,
	) {
		this.#camera.zoom(
			scale,
		);
	}

	setCenter(
		position: Position,
	) {
		this.#camera.setCenter(
			position,
		);
	}

	update(
		state: WaveState,
	) {
		const playerPosition =
			state
				.players[0]
				?.position ??
			zeroPoint();
		this.#moveCamera(
			playerPosition,
		);
		this.#camera.update(
			state,
		);
	}

	#moveCamera(
		playerPosition: Position,
	) {
		if (
			!this.#isSmallScreen(
				computedMapSizeForWindow.value,
				canvasSize.value,
			)
		) {
			this.#moveToCenter();
			return;
		}
		const scale =
			this
				.stage
				.scale
				.x;
		const position =
			{
				x:
					playerPosition.x *
					scale,
				y:
					playerPosition.y *
					scale,
			};

		this.stage.x =
			-position.x +
			canvasSize
				.value
				.width /
				2;
		this.stage.y =
			-position.y +
			canvasSize
				.value
				.height /
				2;
	}

	#isSmallScreen(
		playingFieldSize: Size,
		canvasSize: Size,
	) {
		return (
			playingFieldSize.width >
				canvasSize.width ||
			playingFieldSize.height >
				canvasSize.height
		);
	}

	#moveToCenter() {
		this.stage.x =
			(canvasSize
				.value
				.width -
				computedMapSizeForWindow
					.value
					.width) /
			2;
		this.stage.y =
			(canvasSize
				.value
				.height -
				computedMapSizeForWindow
					.value
					.height) /
			2;
	}
}
