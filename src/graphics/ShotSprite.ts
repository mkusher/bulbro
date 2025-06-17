import * as PIXI from "pixi.js";
import type { Position } from "../geometry";
import type { ShotState } from "../currentState";

const SHOT_SIZE = 4;
/**
 * Manages an enemy sprite graphic.
 */
export class ShotSprite {
	#gfx: PIXI.Graphics;
	#scale: number;

	constructor(scale: number, shot: ShotState) {
		this.#scale = scale;
		this.#gfx = new PIXI.Graphics();
		this.#gfx.beginFill(shot.shooterType === "player" ? 0x000000 : 0x961ea3);
		this.#gfx.drawCircle(0, 0, SHOT_SIZE);
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
		this.#gfx.x = pos.x / this.#scale;
		this.#gfx.y = pos.y / this.#scale;
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
