import * as PIXI from "pixi.js";
import type { Size } from "@/geometry";

const assetUrl = "/game-assets/bulbro-heroes.png";

export const faces = {
	normal: {
		position: {
			x: 236,
			y: 186,
		},
		size: {
			width: 71,
			height: 65,
		},
		offset: {
			x: 18,
			y: 36,
		},
	},
	evil: {
		position: {
			x: 190,
			y: 483,
		},
		size: {
			width: 131,
			height: 72,
		},
	},
	vampire: {
		position: {
			x: 345,
			y: 483,
		},
		size: {
			width: 131,
			height: 72,
		},
	},
	old: {
		position: {
			x: 535,
			y: 483,
		},
		size: {
			width: 131,
			height: 122,
		},
	},
	crazy: {
		position: {
			x: 700,
			y: 483,
		},
		size: {
			width: 131,
			height: 122,
		},
	},
	cyborg: {
		position: {
			x: 900,
			y: 483,
		},
		size: {
			width: 176,
			height: 72,
		},
		scale: {
			x: 0.65,
			y: 1,
		},
	},
	king: {
		position: {
			x: 1140,
			y: 382,
		},
		size: {
			width: 131,
			height: 240,
		},
		offset: {
			x: 0,
			y: -40,
		},
	},
} as const;

export type FaceType = keyof typeof faces;
export const faceTypes = Object.keys(faces) as FaceType[];

export class FaceSprite {
	#gfx = new PIXI.Sprite();
	#faceType: FaceType;

	constructor(faceType: FaceType) {
		this.#faceType = faceType;
	}
	async init() {
		const fullTexture = await PIXI.Assets.load(assetUrl);
		const face = new PIXI.Texture({
			source: fullTexture,
			frame: new PIXI.Rectangle(
				this.#faceConfiguration.position.x,
				this.#faceConfiguration.position.y,
				this.#faceConfiguration.size.width,
				this.#faceConfiguration.size.height,
			),
		});
		this.#gfx.texture = face;
	}

	get #faceConfiguration() {
		return faces.normal;
	}

	appendTo(container: PIXI.Container, bodySize: Size) {
		this.#gfx.parent?.removeChild(this.#gfx);
		container.addChild(this.#gfx);
		this.#gfx.position.x = this.#faceConfiguration.offset.x;
		this.#gfx.position.y = this.#faceConfiguration.offset.y;
	}
}
