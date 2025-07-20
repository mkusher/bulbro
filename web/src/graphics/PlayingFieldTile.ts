import * as PIXI from "pixi.js";
import { type Size } from "../geometry";
import type { CurrentState } from "../currentState";

/**
 * Handles display of players, enemies, and UI elements in the game scene.
 */
export class PlayingFieldTile {
	#sprite: PIXI.Graphics;
	#container: PIXI.Container;

	constructor(size: Size) {
		this.#sprite = new PIXI.Graphics()
			.rect(0, 0, size.width, size.height)
			.fill(0x475b46);
		this.#container = new PIXI.Container();
		this.#container.addChild(this.#sprite);
	}

	/**
	 * Initializes sprites and UI elements.
	 */
	async init(parent: PIXI.Container, layer?: PIXI.IRenderLayer) {
		parent.addChild(this.#container);
		layer?.attach(this.#container);
	}

	get container() {
		return this.#container;
	}

	update(deltaTime: number, state: CurrentState): void {}
}
