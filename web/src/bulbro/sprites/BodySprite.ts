import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";

export class BodySprite {
	#bodyPosition =
		{
			x: 68,
			y: 68,
		} as const;
	#bodySize =
		{
			width: 100,
			height: 130,
		} as const;
	#gfx =
		new PIXI.Sprite();

	constructor() {}
	get size() {
		return this
			.#bodySize;
	}
	async init() {
		const fullTexture =
			await Assets.get(
				"bulbroHeroes",
			);
		const bodyTexture =
			new PIXI.Texture(
				{
					source:
						fullTexture,
					frame:
						new PIXI.Rectangle(
							this
								.#bodyPosition
								.x,
							this
								.#bodyPosition
								.y,
							this
								.#bodySize
								.width,
							this
								.#bodySize
								.height,
						),
				},
			);
		bodyTexture.source.scaleMode =
			"nearest";

		this.#gfx.texture =
			bodyTexture;
	}

	appendTo(
		container: PIXI.Container,
	) {
		container.addChild(
			this
				.#gfx,
		);
	}

	remove() {
		this.#gfx.parent?.removeChild(
			this
				.#gfx,
		);
	}
}
