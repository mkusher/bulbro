import * as PIXI from "pixi.js";
import type { DeltaTime } from "@/time";
import { rotation } from "../geometry";
import type { ShotState } from "./ShotState";

const explosiveRadius = 7;

/** A dark round shell with a glowing fuse at its front (sprites point up at 0°). */
function explosiveProjectile() {
	return new PIXI.Graphics()
		.circle(
			0,
			0,
			explosiveRadius,
		)
		.fill(
			0x3d4a2a,
		)
		.stroke(
			{
				width: 2,
				color: 0x1b1f14,
			},
		)
		.circle(
			0,
			-explosiveRadius,
			3,
		)
		.fill(
			0xff7a1a,
		);
}
/** A small hot round with a tapered amber tracer trailing behind it. */
function firedRound() {
	return new PIXI.Graphics()
		.poly(
			[
				0,
				-10,
				-5,
				8,
				0,
				34,
				5,
				8,
			],
		)
		.fill(
			{
				color: 0xffa43b,
				alpha: 0.12,
			},
		)
		.poly(
			[
				-2,
				-5,
				-2,
				8,
				0,
				26,
				2,
				8,
				2,
				-5,
			],
		)
		.fill(
			{
				color: 0xffcc70,
				alpha: 0.45,
			},
		)
		.roundRect(
			-2,
			-10,
			4,
			17,
			2,
		)
		.fill(
			0xffe0a3,
		)
		.roundRect(
			-1,
			-10,
			2,
			12,
			1,
		)
		.fill(
			0xfffcf0,
		);
}
/**
 * Manages a bullet sprite graphic.
 */
export class BulletSprite {
	#gfx: PIXI.Graphics;

	constructor(
		shot: ShotState,
	) {
		this.#gfx =
			shot.isExplosive
				? explosiveProjectile()
				: firedRound();
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
