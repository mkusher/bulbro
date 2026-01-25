import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";
import type {
	Position,
	Size,
} from "@/geometry";

export type LegState =
	| "normal"
	| "wide-l"
	| "wide-r"
	| "normal-r";

export class LegsSprite {
	#rightLegPosition =
		{
			x: 71,
			y: 221,
		} as const;
	#rightLegSize =
		{
			width: 35,
			height: 37,
		} as const;
	#leftLegPosition =
		{
			x: 136,
			y: 221,
		} as const;
	#leftLegSize =
		{
			width: 37,
			height: 35,
		} as const;
	#gfx =
		new PIXI.Container();
	#leftLeg =
		new PIXI.Sprite();
	#rightLeg =
		new PIXI.Sprite();

	constructor() {}
	async init() {
		const fullTexture =
			await Assets.get(
				"bulbroHeroes",
			);
		const leftLeg =
			this.#createLeg(
				fullTexture,
				this
					.#leftLegPosition,
				this
					.#leftLegSize,
			);
		const rightLeg =
			this.#createLeg(
				fullTexture,
				this
					.#rightLegPosition,
				this
					.#rightLegSize,
			);
		this.#leftLeg.texture =
			leftLeg;
		this.#rightLeg.texture =
			rightLeg;
		this.#gfx.addChild(
			this
				.#leftLeg,
		);
		this.#gfx.addChild(
			this
				.#rightLeg,
		);
	}

	#createLeg =
		(
			source: PIXI.TextureSource,
			position: Position,
			size: Size,
		) => {
			const texture =
				new PIXI.Texture(
					{
						source,
						frame:
							new PIXI.Rectangle(
								position.x,
								position.y,
								size.width,
								size.height,
							),
					},
				);
			texture.source.scaleMode =
				"linear";
			return texture;
		};

	appendTo(
		container: PIXI.Container,
		bodySize: Size,
		legState: LegState = "normal",
	) {
		container.addChild(
			this
				.#gfx,
		);
		this.#gfx.position.y =
			bodySize.height *
			0.9;

		// Base positions (for normal/idle state)
		const leftBaseX =
			bodySize.width *
			0.6;
		const rightBaseX =
			bodySize.width *
			0.05;

		switch (
			legState
		) {
			case "wide-l":
				// Left leg forward, right leg back
				this.#leftLeg.position.x =
					leftBaseX +
					15;
				this.#leftLeg.position.y =
					-5;
				this.#rightLeg.position.x =
					rightBaseX -
					10;
				this.#rightLeg.position.y = 3;
				break;
			case "wide-r":
				// Right leg forward, left leg back
				this.#leftLeg.position.x =
					leftBaseX -
					10;
				this.#leftLeg.position.y = 3;
				this.#rightLeg.position.x =
					rightBaseX +
					15;
				this.#rightLeg.position.y =
					-5;
				break;
			case "normal-r":
				// Transitional state - slightly offset
				this.#leftLeg.position.x =
					leftBaseX +
					5;
				this.#leftLeg.position.y = 0;
				this.#rightLeg.position.x =
					rightBaseX +
					5;
				this.#rightLeg.position.y = 0;
				break;
			case "normal":
			default:
				// Default idle position
				this.#leftLeg.position.x =
					leftBaseX;
				this.#leftLeg.position.y = 0;
				this.#rightLeg.position.x =
					rightBaseX;
				this.#rightLeg.position.y = 0;
				break;
		}
	}
}
