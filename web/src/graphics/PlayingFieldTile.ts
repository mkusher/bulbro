import * as PIXI from "pixi.js";
import type { DeltaTime } from "@/time";
import type { Size } from "../geometry";
import { BackgroundPatternSprite } from "../object/BackgroundPatternSprite";
import type { WaveState } from "../waveState";

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
					0x475b46,
				);
		this.#container =
			new PIXI.Container();
		this.#container.addChild(
			this
				.#sprite,
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
