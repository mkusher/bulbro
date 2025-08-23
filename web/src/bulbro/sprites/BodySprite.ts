import * as PIXI from "pixi.js";
const assetUrl = "/game-assets/bulbro-heroes.png";

export class BodySprite {
	#bodyPosition = {
		x: 68,
		y: 68,
	} as const;
	#bodySize = {
		width: 100,
		height: 130,
	} as const;
	#gfx = new PIXI.Sprite();

	constructor() {}
	get size() {
		return this.#bodySize;
	}
	async init() {
		const fullTexture = await PIXI.Assets.load(assetUrl);
		const bodyTexture = new PIXI.Texture({
			source: fullTexture,
			frame: new PIXI.Rectangle(
				this.#bodyPosition.x,
				this.#bodyPosition.y,
				this.#bodySize.width,
				this.#bodySize.height,
			),
		});

		this.#gfx.texture = bodyTexture;
	}

	appendTo(container: PIXI.Container) {
		this.remove();
		container.addChild(this.#gfx);
	}

	remove() {
		this.#gfx.parent?.removeChild(this.#gfx);
	}
}
