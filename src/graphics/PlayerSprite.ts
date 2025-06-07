import * as PIXI from "pixi.js";
import type { Position } from "../geometry";
import { PLAYER_SIZE } from "../bulbro";

/**
 * Manages a player sprite graphic.
 */
export class PlayerSprite {
	#gfx: PIXI.Graphics;

	constructor() {
		this.#gfx = new PIXI.Graphics();
		this.#gfx.beginFill(0x99ccff);
		this.#gfx.drawRect(
			-PLAYER_SIZE.width / 2,
			-PLAYER_SIZE.height / 2,
			PLAYER_SIZE.width,
			PLAYER_SIZE.height,
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
