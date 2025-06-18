import * as PIXI from "pixi.js";

import { ENEMY_SIZE } from "..";
import type { EnemyState } from "../EnemyState";

import type { Position } from "../../geometry";
import { AnimatedSprite } from "../../graphics/AnimatedSprite";
import { CharacterSprites } from "../../graphics/CharacterSprite";

/**
 * Manages an enemy sprite graphic.
 */
export class SlimeSprite {
	#gfx: PIXI.Container;
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#movement?: AnimatedSprite;
	#idle?: AnimatedSprite;
	#warning?: AnimatedSprite;
	#danger?: AnimatedSprite;
	#death?: AnimatedSprite;
	#characterSprites?: CharacterSprites;
	#levels = {
		x: [8, 40, 72, 104, 136, 168],
		y: [12, 44, 76, 102, 134, 166, 194, 226, 258, 294, 320, 354, 386],
	};
	#scale: number;

	constructor(scale: number, debug?: boolean) {
		this.#gfx = new PIXI.Container();
		this.#sprite = new PIXI.Sprite();
		this.#gfx.addChild(this.#sprite);
		this.#debugPosition = new PIXI.Graphics();
		if (debug) {
			this.#debugPosition.beginFill(0x0000ff, 0.4);
			this.#debugPosition.drawRect(-8, -8, 8, 8);
			this.#debugPosition.endFill();
			this.#gfx.addChild(this.#debugPosition);
		}

		this.#scale = scale;
		this.init();
	}

	async init() {
		this.#sprite.scale.set(2);
		const fullTexture = await PIXI.Assets.load("/assets/slime.png");

		this.#movement = new AnimatedSprite(
			6,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						this.#levels.x[frame],
						this.#levels.y[4],
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
			75,
		);

		this.#idle = new AnimatedSprite(
			5,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						this.#levels.x[frame],
						this.#levels.y[3],
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
		);

		this.#warning = new AnimatedSprite(
			3,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						this.#levels.x[frame],
						this.#levels.y[2],
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
		);

		this.#danger = new AnimatedSprite(
			3,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						this.#levels.x[frame],
						this.#levels.y[9],
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
		);

		this.#death = new AnimatedSprite(
			5,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						this.#levels.x[frame],
						this.#levels.y[12],
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
			125,
			false,
		);

		this.#characterSprites = new CharacterSprites({
			walking: this.#movement,
			idle: this.#idle,
			hurt: this.#warning,
			hurtALot: this.#danger,
			dead: this.#death,
		});

		this.#sprite.texture = await this.#idle.getSprite(0);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container): void {
		parent.addChild(this.#gfx);
	}

	update(enemy: EnemyState, delta: number) {
		this.#updatePosition(enemy.position);

		this.#characterSprites?.getSprite(enemy, delta).then((texture) => {
			this.#sprite.texture = texture;
		});
	}

	/**
	 * Updates sprite position.
	 */
	#updatePosition(pos: Position): void {
		this.#gfx.x = pos.x / this.#scale;
		this.#gfx.y = pos.y / this.#scale;
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#gfx.parent?.removeChild(this.#gfx);
	}
}
