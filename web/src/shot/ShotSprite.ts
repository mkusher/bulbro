import * as PIXI from "pixi.js";
import type { ShotState } from "./ShotState";
import { BulletSprite } from "./BulletSprite";
import { EnemyProjectileSprite } from "./EnemyProjectileSprite";

export class ShotSprite {
	#gfx: PIXI.Graphics;
	#sprite: EnemyProjectileSprite | BulletSprite;

	constructor(shot: ShotState) {
		this.#gfx = new PIXI.Graphics();
		this.#sprite =
			shot.shooterType === "player"
				? new BulletSprite(shot)
				: new EnemyProjectileSprite(shot);
		this.#sprite.appendTo(this.#gfx);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer?: PIXI.IRenderLayer): void {
		parent.addChild(this.#gfx);
		layer?.attach(this.#gfx);
	}

	/**
	 * Updates sprite position.
	 */
	update(deltaTime: number, shot: ShotState) {
		this.#gfx.x = shot.position.x;
		this.#gfx.y = shot.position.y;
		this.#sprite.update(deltaTime, shot);
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#sprite.remove();
		this.#gfx.parent?.removeChild(this.#gfx);
	}
}
