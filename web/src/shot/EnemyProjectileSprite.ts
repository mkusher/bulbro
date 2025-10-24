import * as PIXI from "pixi.js";
import type { ShotState } from "./ShotState";
import type { DeltaTime } from "@/time";

const radius = 4;
export class EnemyProjectileSprite {
	#gfx: PIXI.Graphics;

	constructor(shot: ShotState) {
		this.#gfx = new PIXI.Graphics()
			.circle(-radius, -radius, radius)
			.fill(0xff0000)
			.circle(-radius, -radius, radius / 2)
			.fill(0xffffff);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer?: PIXI.RenderLayer): void {
		parent.addChild(this.#gfx);
		layer?.attach(this.#gfx);
	}

	update(deltaTime: DeltaTime, shot: ShotState) {}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#gfx.parent?.removeChild(this.#gfx);
	}
}
