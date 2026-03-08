import * as PIXI from "pixi.js";
import type { Size } from "@/geometry";

export class ShadowSprite {
	#graphic: PIXI.Graphics;

	constructor(
		entitySize: Size,
	) {
		const radiusX =
			entitySize.width *
			0.45;
		const radiusY =
			radiusX *
			0.4;

		this.#graphic =
			new PIXI.Graphics();
		this.#graphic.ellipse(
			0,
			0,
			radiusX,
			radiusY,
		);
		this.#graphic.fill(
			{
				color: 0x000000,
				alpha: 0.35,
			},
		);
		this.#graphic.filters =
			[
				new PIXI.BlurFilter(
					{
						strength: 2,
					},
				),
			];
		this.#graphic.y = 2;
	}

	appendTo(
		parent: PIXI.Container,
	): void {
		parent.addChild(
			this
				.#graphic,
		);
	}

	set visible(value: boolean,) {
		this.#graphic.visible =
			value;
	}
}
