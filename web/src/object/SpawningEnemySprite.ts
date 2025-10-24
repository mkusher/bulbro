import * as PIXI from "pixi.js";
import type { SpawningEnemy } from "./SpawningEnemyState";
import type { DeltaTime } from "@/time";
import { Assets } from "@/Assets";

/**
 * Manages an enemy sprite graphic.
 */
export class SpawningEnemySprite {
	#container: PIXI.Container;
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#size = 16;
	#width = 140;
	#height = 140;

	constructor(debug?: boolean) {
		this.#container = new PIXI.Container();
		this.#sprite = new PIXI.Sprite();
		this.#sprite.scale.set(0.2);
		this.#sprite.x = -this.#width / 2;
		this.#sprite.y = -this.#height / 2;
		this.#container.addChild(this.#sprite);
		this.#debugPosition = new PIXI.Graphics();
		if (debug) {
			this.#debugPosition.beginFill(0x0000ff, 0.4);
			this.#debugPosition.drawRect(-8, -8, 8, 8);
			this.#debugPosition.endFill();
			this.#container.addChild(this.#debugPosition);
		}
		this.init();
	}

	async init() {
		const texture = await Assets.get("objects");
		this.#sprite.texture = new PIXI.Texture({
			source: texture,
			frame: new PIXI.Rectangle(45, 630, this.#width, this.#height),
		});
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer?: PIXI.RenderLayer): void {
		parent.addChild(this.#container);
		layer?.attach(this.#container);
	}

	update(spawningEnemy: SpawningEnemy, deltaTime: DeltaTime) {
		this.#container.x = spawningEnemy.position.x;
		this.#container.y = spawningEnemy.position.y;
		this.#sprite.alpha = Math.sin(
			(((Date.now() - spawningEnemy.startedAt) / 50) * Math.PI) / 8,
		);
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#container.parent?.removeChild(this.#container);
	}
}
