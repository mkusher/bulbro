import * as PIXI from "pixi.js";
import type { Size } from "@/geometry";

let shadowTexture:
	| PIXI.Texture
	| undefined;

/** Shared soft disc; sprites stretch it into an ellipse without a blur pass. */
function getShadowTexture(): PIXI.Texture {
	if (
		shadowTexture
	)
		return shadowTexture;
	const size = 64;
	const pixels =
		new Uint8Array(
			size *
				size *
				4,
		);
	for (
		let y = 0;
		y <
		size;
		y++
	) {
		for (
			let x = 0;
			x <
			size;
			x++
		) {
			const radius =
				Math.hypot(
					(x +
						0.5 -
						size /
							2) /
						(size /
							2),
					(y +
						0.5 -
						size /
							2) /
						(size /
							2),
				);
			const edge =
				Math.max(
					0,
					Math.min(
						1,
						(1 -
							radius) /
							0.25,
					),
				);
			pixels[
				(y *
					size +
					x) *
					4 +
					3
			] =
				Math.round(
					255 *
						edge *
						edge *
						(3 -
							2 *
								edge),
				);
		}
	}
	shadowTexture =
		new PIXI.Texture(
			{
				source:
					new PIXI.BufferImageSource(
						{
							resource:
								pixels,
							width:
								size,
							height:
								size,
							scaleMode:
								"linear",
						},
					),
			},
		);
	return shadowTexture;
}

export class ShadowSprite {
	#sprite: PIXI.Sprite;
	constructor(
		entitySize: Size,
	) {
		this.#sprite =
			new PIXI.Sprite(
				getShadowTexture(),
			);
		this.#sprite.anchor.set(
			0.5,
		);
		this.#sprite.width =
			entitySize.width *
			0.9;
		this.#sprite.height =
			entitySize.width *
			0.9 *
			0.4;
		this.#sprite.alpha = 0.35;
		this.#sprite.y = 2;
	}
	appendTo(
		parent: PIXI.Container,
	): void {
		parent.addChild(
			this
				.#sprite,
		);
	}
	set visible(value: boolean) {
		this.#sprite.visible =
			value;
	}
}
