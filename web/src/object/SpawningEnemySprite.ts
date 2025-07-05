import * as PIXI from "pixi.js";
import type { SpawningEnemy } from "./SpawningEnemyState";

/**
 * Manages an enemy sprite graphic.
 */
export class SpawningEnemySprite {
	#container: PIXI.Container;
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#scale: number;
	#size = 16;
	#width = 83;
	#height = 72;

	constructor(scale: number, debug?: boolean) {
		this.#scale = scale;
		this.#container = new PIXI.Container();
		this.#sprite = new PIXI.Sprite();
		this.#sprite.scale.set(0.5);
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
		const texture = await PIXI.Assets.load(
			"/assets/craftpix-net-266622-free-top-down-pixel-art-cave-objects/PNG/Cave_objects_source.png",
		);
		const top = 590;
		const left = 230;
		this.#sprite.texture = new PIXI.Texture({
			source: texture,
			frame: new PIXI.Rectangle(left, top, this.#width, this.#height),
		});
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer?: PIXI.IRenderLayer): void {
		parent.addChild(this.#container);
		layer?.attach(this.#container);
	}

	update(spawningEnemy: SpawningEnemy, deltaTime: number) {
		this.#container.x = spawningEnemy.position.x / this.#scale;
		this.#container.y = spawningEnemy.position.y / this.#scale;
		this.#sprite.alpha = Math.sin(
			(((Date.now() - spawningEnemy.startedAt.getTime()) / 50) * Math.PI) / 8,
		);
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#container.parent?.removeChild(this.#container);
	}
}
