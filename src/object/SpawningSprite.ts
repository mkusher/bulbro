import * as PIXI from "pixi.js";

import type { EnemyState } from "../enemy/EnemyState";

/**
 * Manages an enemy sprite graphic.
 */
export class SpawningEnemySprite {
	#container: PIXI.Container;
	#sprite: PIXI.Graphics;
	#debugPosition: PIXI.Graphics;
	#scale: number;

	constructor(scale: number, debug?: boolean) {
		this.#scale = scale;
		this.#container = new PIXI.Container();
		this.#sprite = new PIXI.Graphics();
		this.#container.addChild(this.#sprite);
		this.#debugPosition = new PIXI.Graphics();
		if (debug) {
			this.#debugPosition.beginFill(0x0000ff, 0.4);
			this.#debugPosition.drawRect(-8, -8, 8, 8);
			this.#debugPosition.endFill();
			this.#container.addChild(this.#debugPosition);
		}
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container): void {
		parent.addChild(this.#container);
	}

	update(enemy: EnemyState, delta: number) {}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#container.parent?.removeChild(this.#container);
	}
}
