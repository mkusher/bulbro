import * as PIXI from "pixi.js";
import type { Position } from "../geometry";
import { PLAYER_SIZE } from "../bulbro";
import type { PlayerState } from "../currentState";

/**
 * Manages a player sprite graphic.
 */
export class PlayerSprite {
	#gfx: PIXI.Container;
	#sprite: PIXI.Sprite;
	#lastMovingFrame: number = 0;
	#lastMovedAt = Date.now();

	constructor() {
		this.#gfx = new PIXI.Container();
		this.#sprite = new PIXI.Sprite();
		this.#gfx.addChild(this.#sprite);
		this.init();
	}

	async #getCroppedIcon(x: number, y: number) {
		const offset = 39;
		const level = 100;
		const fullTexture = await PIXI.Assets.load("/assets/Soldier.png");

		const left = x * level + offset;
		const top = y * level + offset;

		return new PIXI.Texture({
			source: fullTexture,
			frame: new PIXI.Rectangle(
				left,
				top,
				PLAYER_SIZE.width,
				PLAYER_SIZE.height,
			),
		});
	}

	async init() {
		this.#sprite.texture = await this.#getCroppedIcon(0, 0);
		this.#sprite.scale.set(1.5);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container): void {
		parent.addChild(this.#gfx);
	}

	update(player: PlayerState, delta: number) {
		this.#updatePosition(player.position);

		const movingAnimationDelay = 100;
		if (Date.now() - player.lastHitAt?.getTime() < movingAnimationDelay * 5) {
			if (player.healthPoints / player.stats.maxHp < 0.3) {
				this.#setDanger();
			} else {
				this.#setWarning();
			}
		} else {
			if (Date.now() - player.lastMovedAt.getTime() < movingAnimationDelay) {
				this.#nextMovingFrame();
			} else {
				this.#setHealthy();
			}
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
	/**
	 * Sets sprite opacity.
	 */
	async #setHealthy() {
		this.#sprite.texture = await this.#getCroppedIcon(0, 0);
	}

	async #setDanger() {
		this.#sprite.texture = await this.#getCroppedIcon(1, 5);
	}

	async #setWarning() {
		this.#sprite.texture = await this.#getCroppedIcon(2, 5);
	}

	async #nextMovingFrame() {
		const animationDelay = 100;
		if (Date.now() - this.#lastMovedAt > animationDelay) {
			this.#sprite.texture = await this.#getCroppedIcon(
				this.#lastMovingFrame,
				1,
			);
			this.#lastMovingFrame = (this.#lastMovingFrame + 1) % 5;
			this.#lastMovedAt = Date.now();
		}
	}
}
