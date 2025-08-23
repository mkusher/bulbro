import * as PIXI from "pixi.js";
import type { Position, Size } from "@/geometry";
const assetUrl = "/game-assets/bulbro-heroes.png";

export type LegState = "normal" | "wide-l" | "wide-r" | "normal-r";

export class LegsSprite {
	#rightLegPosition = {
		x: 71,
		y: 221,
	} as const;
	#rightLegSize = {
		width: 35,
		height: 37,
	} as const;
	#leftLegPosition = {
		x: 136,
		y: 221,
	} as const;
	#leftLegSize = {
		width: 37,
		height: 35,
	} as const;
	#gfx = new PIXI.Container();
	#leftLeg = new PIXI.Sprite();
	#rightLeg = new PIXI.Sprite();

	constructor() {}
	async init() {
		const fullTexture = await PIXI.Assets.load(assetUrl);
		const leftLeg = this.#createLeg(
			fullTexture,
			this.#leftLegPosition,
			this.#leftLegSize,
		);
		const rightLeg = this.#createLeg(
			fullTexture,
			this.#rightLegPosition,
			this.#rightLegSize,
		);
		this.#leftLeg.texture = leftLeg;
		this.#rightLeg.texture = rightLeg;
		this.#gfx.addChild(this.#leftLeg);
		this.#gfx.addChild(this.#rightLeg);
	}

	#createLeg = (source: PIXI.TextureSource, position: Position, size: Size) => {
		return new PIXI.Texture({
			source,
			frame: new PIXI.Rectangle(
				position.x,
				position.y,
				size.width,
				size.height,
			),
		});
	};

	appendTo(
		container: PIXI.Container,
		bodySize: Size,
		legState: LegState = "normal",
	) {
		this.#gfx.parent?.removeChild(this.#gfx);
		container.addChild(this.#gfx);
		this.#gfx.position.y = bodySize.height * 0.9;
		this.#leftLeg.position.x = bodySize.width * 0.6;
		this.#rightLeg.position.x = bodySize.width * 0.05;
	}
}
