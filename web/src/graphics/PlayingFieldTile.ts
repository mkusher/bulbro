import * as PIXI from "pixi.js";
import type { DeltaTime } from "@/time";
import type { Size } from "../geometry";
import { BackgroundPatternSprite } from "../object/BackgroundPatternSprite";
import type { WaveState } from "../waveState";

export const FIELD_BACKGROUND_COLOR = 0x475b46;

const NOISE_TILE_SIZE = 128;

function createNoiseTexture(): PIXI.Texture {
	const canvas =
		document.createElement(
			"canvas",
		);
	canvas.width =
		NOISE_TILE_SIZE;
	canvas.height =
		NOISE_TILE_SIZE;
	const ctx =
		canvas.getContext(
			"2d",
		)!;
	const imageData =
		ctx.createImageData(
			NOISE_TILE_SIZE,
			NOISE_TILE_SIZE,
		);
	const data =
		imageData.data;
	for (
		let i = 0;
		i <
		data.length;
		i += 4
	) {
		const noise =
			Math.random() *
			255 *
			0.15;
		data[
			i
		] =
			noise;
		data[
			i +
				1
		] =
			noise;
		data[
			i +
				2
		] =
			noise;
		data[
			i +
				3
		] =
			255;
	}
	ctx.putImageData(
		imageData,
		0,
		0,
	);
	return PIXI.Texture.from(
		canvas,
	);
}

/**
 * Handles display of players, enemies, and UI elements in the game scene.
 */
export class PlayingFieldTile {
	#sprite: PIXI.Graphics;
	#container: PIXI.Container;
	#backgroundPattern: BackgroundPatternSprite;

	constructor(
		size: Size,
	) {
		this.#sprite =
			new PIXI.Graphics()
				.rect(
					0,
					0,
					size.width,
					size.height,
				)
				.fill(
					FIELD_BACKGROUND_COLOR,
				);
		this.#container =
			new PIXI.Container();

		const noiseTexture =
			createNoiseTexture();
		const noiseOverlay =
			new PIXI.TilingSprite(
				{
					texture:
						noiseTexture,
					width:
						size.width,
					height:
						size.height,
				},
			);
		noiseOverlay.alpha = 0.25;

		this.#container.addChild(
			this
				.#sprite,
		);
		this.#container.addChild(
			noiseOverlay,
		);

		this.#backgroundPattern =
			new BackgroundPatternSprite(
				size,
			);
	}

	/**
	 * Initializes sprites and UI elements.
	 */
	async init(
		parent: PIXI.Container,
		layer?: PIXI.RenderLayer,
		groundLayer?: PIXI.RenderLayer,
	) {
		parent.addChild(
			this
				.#container,
		);
		layer?.attach(
			this
				.#container,
		);
		await this.#backgroundPattern.init(
			this
				.#container,
			groundLayer,
		);
	}

	get container() {
		return this
			.#container;
	}

	update(
		deltaTime: DeltaTime,
		state: WaveState,
	): void {}
}
