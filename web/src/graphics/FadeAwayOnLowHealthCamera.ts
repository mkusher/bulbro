import * as PIXI from "pixi.js";
import type {
	Position,
	Size,
} from "@/geometry";
import type { WaveState } from "@/waveState";
import type { Camera } from "./Camera";
import { Assets } from "@/Assets";

/**
 * Decorator that darkens the screen when player health drops below 50%.
 * Uses a multiply-blended lightmap sprite overlay whose alpha transitions
 * from 0.1 at 50% hp to 1.0 at 0% hp.
 */
export class FadeAwayOnLowHealthCamera
	implements
		Camera
{
	#camera: Camera;
	#overlay: PIXI.Sprite | null =
		null;

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
		const source =
			await Assets.get(
				"lightmap",
			);
		const texture =
			new PIXI.Texture(
				{
					source,
				},
			);
		this.#overlay =
			new PIXI.Sprite(
				texture,
			);
		this.#overlay.width =
			size.width;
		this.#overlay.height =
			size.height;
		this.#overlay.blendMode =
			"multiply";
		this.#overlay.alpha = 0;
		this.ui.addChild(
			this
				.#overlay,
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
		const player =
			state
				.players[0];
		const healthPoints =
			player?.healthPoints ??
			0;
		const maxHp =
			player
				?.stats
				.maxHp ??
			1;

		const ratio =
			maxHp >
			0
				? healthPoints /
					maxHp
				: 0;

		if (
			this
				.#overlay
		) {
			if (
				ratio >
				0.5
			) {
				this.#overlay.alpha = 0;
			} else {
				// At 50% hp: alpha = 0.1, at 0% hp: alpha = 1.0
				const t =
					1 -
					ratio /
						0.5;
				this.#overlay.alpha =
					0.1 +
					t *
						0.9;
			}
		}

		this.#camera.update(
			state,
		);
	}
}
