import * as PIXI from "pixi.js";
import type { Position } from "../geometry";
import { PLAYER_SIZE } from "../bulbro";

/**
 * Manages a player sprite graphic.
 */
export class PlayerSprite {
	#gfx: PIXI.Container;
	#sprite?: PIXI.Sprite;

	constructor() {
		this.#gfx = new PIXI.Container();
		this.init();
	}

	async init() {
		const fullTexture = await PIXI.Assets.load("/assets/Soldier.png");

		const offset = 39;
		const croppedTexture = new PIXI.Texture({
			source: fullTexture,
			frame: new PIXI.Rectangle(
				offset,
				offset,
				PLAYER_SIZE.width,
				PLAYER_SIZE.height,
			),
		});

		const fullSprite = new PIXI.Sprite({
			texture: croppedTexture,
		});

		this.#sprite = fullSprite;
		this.#sprite.scale.set(1.5);
		this.#gfx.addChild(this.#sprite);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container): void {
		parent.addChild(this.#gfx);
	}

	/**
	 * Updates sprite position.
	 */
	updatePosition(pos: Position): void {
		this.#gfx.x = pos.x;
		this.#gfx.y = pos.y;
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#gfx.parent?.removeChild(this.#gfx);
	}
	/**
	 * Sets sprite opacity.
	 */
	setAlpha(alpha: number): void {
		this.#gfx.alpha = alpha;
	}
}
