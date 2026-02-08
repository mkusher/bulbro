import * as PIXI from "pixi.js";
import type { DeltaTime } from "@/time";
import type { Size } from "../geometry";
import { BackgroundPatternSprite } from "../object/BackgroundPatternSprite";
import type { WaveState } from "../waveState";

export const FIELD_BACKGROUND_COLOR = 0x475b46;
const GRASS_DARKER = 0x3d4a37;
const GRASS_LIGHTER = 0x5a6e52;
const DITHER_PATTERN_SIZE = 8;

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
		this.#container.addChild(
			this
				.#sprite,
		);

		// Add dithering pattern for grass variation
		const ditherPattern =
			new PIXI.Graphics();
		for (
			let x = 0;
			x <
			size.width;
			x +=
				DITHER_PATTERN_SIZE *
				2
		) {
			for (
				let y = 0;
				y <
				size.height;
				y +=
					DITHER_PATTERN_SIZE *
					2
			) {
				ditherPattern
					.rect(
						x,
						y,
						DITHER_PATTERN_SIZE,
						DITHER_PATTERN_SIZE,
					)
					.fill(
						GRASS_DARKER,
					);
				ditherPattern
					.rect(
						x +
							DITHER_PATTERN_SIZE,
						y +
							DITHER_PATTERN_SIZE,
						DITHER_PATTERN_SIZE,
						DITHER_PATTERN_SIZE,
					)
					.fill(
						GRASS_LIGHTER,
					);
			}
		}
		this.#container.addChild(
			ditherPattern,
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
