import * as PIXI from "pixi.js";
import type { Position } from "../geometry";

const SHOT_SIZE = {
	width: 4,
	height: 4,
};
/**
 * Manages an enemy sprite graphic.
 */
export class ShotSprite {
	#gfx: PIXI.Graphics;

	constructor() {
		this.#gfx = new PIXI.Graphics();
		this.#gfx.beginFill(0x990000);
		this.#gfx.drawRect(
			-SHOT_SIZE.width / 2,
			-SHOT_SIZE.height / 2,
			SHOT_SIZE.width,
			SHOT_SIZE.height,
		);
		this.#gfx.endFill();
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
