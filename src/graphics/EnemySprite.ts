import * as PIXI from "pixi.js";
import type { Position } from "../geometry";
import { ENEMY_SIZE } from "../enemy";
import type { EnemyState } from "../currentState";

const animationDelay = 100;

/**
 * Manages an enemy sprite graphic.
 */
export class EnemySprite {
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
		const fullTexture = await PIXI.Assets.load("/assets/Orc.png");

		const left = x * level + offset;
		const top = y * level + offset;

		return new PIXI.Texture({
			source: fullTexture,
			frame: new PIXI.Rectangle(left, top, ENEMY_SIZE.width, ENEMY_SIZE.height),
		});
	}

	async init() {
		await this.#setHealthy();
		this.#sprite.scale.set(2);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container): void {
		parent.addChild(this.#gfx);
	}

	update(enemy: EnemyState) {
		this.#updatePosition(enemy.position);
		if (enemy.killedAt) {
			this.#killedFrames(enemy);
			return;
		}
		const hitAnimationDelay = 500;
		if (Date.now() - enemy.lastHitAt?.getTime() < hitAnimationDelay * 5) {
			if (enemy.healthPoints / enemy.stats.maxHp < 0.3) {
				this.#setDanger();
			} else {
				this.#setWarning();
			}
		} else {
			const isMovingDelay = 100;

			if (Date.now() - enemy.lastMovedAt.getTime() < isMovingDelay) {
				this.#nextMovingFrame();
			}
		}
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

	async #nextMovingFrame() {
		if (Date.now() - this.#lastMovedAt > animationDelay) {
			this.#sprite.texture = await this.#getCroppedIcon(
				this.#lastMovingFrame,
				1,
			);
			this.#lastMovingFrame = (this.#lastMovingFrame + 1) % 5;
			this.#lastMovedAt = Date.now();
		}
	}

	async #killedFrames(enemy: EnemyState) {
		if (enemy.killedAt) {
			const maxFrame = 2;
			const frame = Math.min(
				maxFrame,
				Math.floor(
					(Date.now() - enemy.killedAt.getTime()) / (animationDelay * 0.75),
				),
			);
			this.#sprite.texture = await this.#getCroppedIcon(1 + frame, 5);
		}
	}

	async #setHealthy() {
		this.#sprite.texture = await this.#getCroppedIcon(0, 0);
	}

	async #setDanger() {
		this.#sprite.texture = await this.#getCroppedIcon(1, 4);
	}

	async #setWarning() {
		this.#sprite.texture = await this.#getCroppedIcon(2, 4);
	}
}
