import * as PIXI from "pixi.js";
import type { Position } from "../geometry";
import { BULBRO_SIZE } from "../bulbro";
import type { BulbroState } from "./BulbroState";
import { AnimatedSprite } from "../graphics/AnimatedSprite";

/**
 * Manages a player sprite graphic.
 */
export class BulbroSprite {
	#gfx: PIXI.Container;
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#movement?: AnimatedSprite;
	#idle?: AnimatedSprite;
	#warning?: AnimatedSprite;
	#danger?: AnimatedSprite;

	constructor(debug?: boolean) {
		this.#gfx = new PIXI.Container();
		this.#debugPosition = new PIXI.Graphics();
		this.#sprite = new PIXI.Sprite();
		this.#gfx.addChild(this.#sprite);
		if (debug) {
			this.#debugPosition.beginFill(0x0000ff, 0.4);
			this.#debugPosition.drawRect(-10, -10, 10, 10);
			this.#debugPosition.endFill();
			this.#gfx.addChild(this.#debugPosition);
		}
		this.init();
	}

	async init() {
		const offset = 39;
		const level = 100;
		const fullTexture = await PIXI.Assets.load("/assets/Soldier.png");

		this.#movement = new AnimatedSprite(
			8,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						frame * level + offset,
						level + offset,
						BULBRO_SIZE.width,
						BULBRO_SIZE.height,
					),
				}),
		);

		this.#idle = new AnimatedSprite(
			6,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						frame * level + offset,
						offset,
						BULBRO_SIZE.width,
						BULBRO_SIZE.height,
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
						BULBRO_SIZE.width,
						BULBRO_SIZE.height,
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
						BULBRO_SIZE.width,
						BULBRO_SIZE.height,
					),
				}),
		);

		this.#sprite.texture = await this.#idle.getSprite(0);
		this.#sprite.scale.set(1.5);
		this.#sprite.x = -20;
		this.#sprite.y = -24;
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container): void {
		parent.addChild(this.#gfx);
	}

	update(player: BulbroState, delta: number) {
		this.#updatePosition(player.position);

		const now = Date.now();
		const movingAnimationDelay = 100;
		const hitAnimationDelay = movingAnimationDelay * 5;
		if (
			player.lastHitAt &&
			now - player.lastHitAt.getTime() < hitAnimationDelay
		) {
			const anim =
				player.healthPoints / player.stats.maxHp < 0.3
					? this.#danger
					: this.#warning;
			anim?.getSprite(delta).then((texture) => {
				this.#sprite.texture = texture;
			});
		} else if (now - player.lastMovedAt.getTime() < movingAnimationDelay) {
			this.#movement?.getSprite(delta).then((texture) => {
				this.#sprite.texture = texture;
			});
		} else {
			this.#idle?.getSprite(delta).then((texture) => {
				this.#sprite.texture = texture;
			});
		}
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#gfx.parent?.removeChild(this.#gfx);
	}

	/**
	 * Updates sprite position.
	 */
	#updatePosition(pos: Position): void {
		this.#gfx.x = pos.x;
		this.#gfx.y = pos.y;
	}
}
