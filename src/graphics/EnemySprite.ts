import * as PIXI from "pixi.js";
import type { Position } from "../geometry";
import { ENEMY_SIZE } from "../enemy";

/**
 * Manages an enemy sprite graphic.
 */
export class EnemySprite {
	#gfx: PIXI.Graphics;

	constructor() {
		this.#gfx = new PIXI.Graphics();
		this.#gfx.beginFill(0x333333);
		this.#gfx.drawRect(
			-ENEMY_SIZE.width / 2,
			-ENEMY_SIZE.height / 2,
			ENEMY_SIZE.width,
			ENEMY_SIZE.height,
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
