import * as PIXI from "pixi.js";
import type { SpawningEnemy } from "./SpawningEnemyState";

/**
 * Manages an enemy sprite graphic.
 */
export class SpawningEnemySprite {
	#container: PIXI.Container;
	#sprite: PIXI.Graphics;
	#debugPosition: PIXI.Graphics;
	#scale: number;
	#size = 16;

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

	update(spawningEnemy: SpawningEnemy, deltaTime: number) {
		this.#sprite.clear();
		this.#container.x = spawningEnemy.position.x / this.#scale;
		this.#container.y = spawningEnemy.position.y / this.#scale;
		this.#sprite
			.stroke(0xff0000)
			.lineTo(this.#size, this.#size)
			.moveTo(this.#size, 0)
			.lineTo(0, this.#size);
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#container.parent?.removeChild(this.#container);
	}
}
