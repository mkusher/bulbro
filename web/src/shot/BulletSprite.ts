import * as PIXI from "pixi.js";
import type { DeltaTime } from "@/time";
import { rotation } from "../geometry";
import type { ShotState } from "./ShotState";

const width = 8;
const height = 16;
/**
 * Manages a bullet sprite graphic.
 */
export class BulletSprite {
	#gfx: PIXI.Graphics;

	constructor(
		shot: ShotState,
	) {
		this.#gfx =
			new PIXI.Graphics()
				.roundRect(
					-width /
						2,
					-height /
						2,
					width,
					height,
					width,
				)
				.fill(
					0xfff625,
				)
				.stroke(
					0xffffff,
				)
				.lineStyle(
					2,
				);
		// Set initial rotation based on shot direction
		this.#gfx.rotation =
			rotation(
				shot.direction,
			);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(
		parent: PIXI.Container,
		layer?: PIXI.RenderLayer,
	): void {
		parent.addChild(
			this
				.#gfx,
		);
		layer?.attach(
			this
				.#gfx,
		);
	}

	update(
		deltaTime: DeltaTime,
		shot: ShotState,
	) {
		this.#gfx.rotation =
			rotation(
				shot.direction,
			);
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#gfx.parent?.removeChild(
			this
				.#gfx,
		);
	}
}
