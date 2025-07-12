import * as PIXI from "pixi.js";
import { type Size } from "../geometry";
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
	async init(parent: PIXI.Container, layer?: PIXI.IRenderLayer) {
		const texture = await PIXI.Assets.load(
			"/assets/craftpix-net-436971-free-top-down-roguelike-game-kit-pixel-art/2%20Dungeon%20Tileset/1%20Tiles/Tileset.png",
		);
		this.#sprite.texture = new PIXI.Texture({
			source: texture,
			frame: new PIXI.Rectangle(256, 96, 32, 32),
		});
		parent.addChild(this.#container);
		layer?.attach(this.#container);
	}

	get container() {
		return this.#container;
	}

	update(deltaTime: number, state: CurrentState): void {}
}
