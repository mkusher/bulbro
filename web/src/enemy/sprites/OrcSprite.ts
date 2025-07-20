import * as PIXI from "pixi.js";

import { ENEMY_SIZE } from "..";
import type { EnemyState } from "../EnemyState";

import type { Position } from "../../geometry";
import { AnimatedSprite } from "../../graphics/AnimatedSprite";
import { CharacterSprites } from "../../graphics/CharacterSprite";

/**
 * Manages an enemy sprite graphic.
 */
export class OrcSprite {
	#gfx: PIXI.Container;
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#movement?: AnimatedSprite;
	#healthy?: AnimatedSprite;
	#warning?: AnimatedSprite;
	#danger?: AnimatedSprite;
	#death?: AnimatedSprite;
	#characterSprites?: CharacterSprites;

	constructor(debug?: boolean) {
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

		this.init();
	}

	async init() {
		this.#sprite.x = -28;
		this.#sprite.y = -32;
		this.#sprite.scale.set(2);

		const offset = 39;
		const level = 100;
		const fullTexture = await PIXI.Assets.load(
			"/game-assets/Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc/Characters(100x100)/Orc/Orc with shadows/Orc.png",
		);

		this.#movement = new AnimatedSprite(
			5,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						frame * level + offset,
						level + offset,
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
		);

		this.#healthy = new AnimatedSprite(
			1,
			() =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						offset,
						offset,
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
		);

		this.#warning = new AnimatedSprite(
			1,
			() =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						2 * level + offset,
						5 * level + offset,
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
		);

		this.#danger = new AnimatedSprite(
			1,
			() =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						1 * level + offset,
						5 * level + offset,
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
		);

		this.#death = new AnimatedSprite(
			3,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						(frame + 1) * level + offset,
						5 * level + offset,
						ENEMY_SIZE.width,
						ENEMY_SIZE.height,
					),
				}),
			150,
			false,
		);

		this.#characterSprites = new CharacterSprites({
			walking: this.#movement,
			hurt: this.#warning,
			hurtALot: this.#danger,
			dead: this.#death,
		});

		this.#sprite.texture = await this.#healthy.getSprite(0);
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
		this.#gfx.x = pos.x;
		this.#gfx.y = pos.y;
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#gfx.parent?.removeChild(this.#gfx);
	}
}
