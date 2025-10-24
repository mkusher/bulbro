import * as PIXI from "pixi.js";
import type { ShotState } from "./ShotState";
import { rotation } from "../geometry";
import type { DeltaTime } from "@/time";

const width = 8;
const height = 16;
/**
 * Manages an enemy sprite graphic.
 */
export class BulletSprite {
	#gfx: PIXI.Graphics;

	constructor(shot: ShotState) {
		this.#gfx = new PIXI.Graphics()
			.roundRect(-width / 2, -height / 2, width, height, width)
			.fill(0xfff625)
			.stroke(0xffffff)
			.lineStyle(2);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer?: PIXI.RenderLayer): void {
		parent.addChild(this.#gfx);
		layer?.attach(this.#gfx);
	}

	update(deltaTime: DeltaTime, shot: ShotState) {
		this.#gfx.rotation = rotation(shot.direction);
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#gfx.parent?.removeChild(this.#gfx);
	}
}
