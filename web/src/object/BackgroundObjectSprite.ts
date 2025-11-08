import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";
import type { Position } from "../geometry";

export type BackgroundObjectType =
	| "grass"
	| "stones"
	| "sticks";

const size =
	{
		width: 50,
		height: 50,
	};

const objectFrames: Record<
	BackgroundObjectType,
	PIXI.Rectangle
> =
	{
		grass:
			new PIXI.Rectangle(
				370,
				33,
				300,
				205,
			),
		stones:
			new PIXI.Rectangle(
				415,
				320,
				240,
				135,
			),
		sticks:
			new PIXI.Rectangle(
				120,
				410,
				210,
				215,
			),
	};

export class BackgroundObjectSprite {
	#sprite: PIXI.Sprite;
	#container: PIXI.Container;

	constructor(
		position: Position,
	) {
		this.#sprite =
			new PIXI.Sprite();
		this.#container =
			new PIXI.Container();
		this.#container.addChild(
			this
				.#sprite,
		);
		this.#sprite.x =
			-size.width /
			4;
		this.#sprite.y =
			-size.height /
			2;
		this.#container.x =
			position.x;
		this.#container.y =
			position.y;
	}

	async init(
		type: BackgroundObjectType,
	) {
		const source =
			await Assets.get(
				"objects",
			);
		const texture =
			new PIXI.Texture(
				{
					source,
					frame:
						objectFrames[
							type
						],
				},
			);
		this.#sprite.texture =
			texture;
		this.#sprite.scale.set(
			0.1,
		);
	}

	get container() {
		return this
			.#container;
	}
}
