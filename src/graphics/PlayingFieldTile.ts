import * as PIXI from "pixi.js";
import type { Size } from "../geometry";
import type { CurrentState } from "../currentState";

/**
 * Handles display of players, enemies, and UI elements in the game scene.
 */
export class PlayingFieldTile {
	#sprite: PIXI.TilingSprite;
	#container: PIXI.Container;

	constructor(size: Size) {
		this.#sprite = new PIXI.TilingSprite(size);
		this.#container = new PIXI.Container();
		this.#container.addChild(this.#sprite);
	}

	/**
	 * Initializes sprites and UI elements.
	 */
	async init(state: CurrentState, parent: PIXI.Container) {
		const texture = await PIXI.Assets.load("/assets/grass.png");
		this.#sprite.texture = texture;
		parent.addChild(this.#container);
	}

	update(deltaTime: number, state: CurrentState): void {}

	get container() {
		return this.#container;
	}
}
