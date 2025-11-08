import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";
import type { DeltaTime } from "@/time";
import type { Position } from "../geometry";
import type { Material } from "./MaterialState";

const size =
	{
		width: 50,
		height: 50,
	};

export class MaterialSprite {
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#container: PIXI.Container;

	constructor(
		debug: boolean,
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
		this.#debugPosition =
			new PIXI.Graphics();
		if (
			debug
		) {
			this.#debugPosition.beginFill(
				0x0000ff,
				0.4,
			);
			this.#debugPosition.drawRect(
				-10,
				-10,
				10,
				10,
			);
			this.#debugPosition.endFill();
			this.#container.addChild(
				this
					.#debugPosition,
			);
		}
	}

	/**
	 * Initializes sprites and UI elements.
	 */
	async init(
		material: Material,
		parent: PIXI.Container,
		layer: PIXI.RenderLayer,
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
						new PIXI.Rectangle(
							763,
							33,
							200,
							265,
						),
				},
			);
		this.#sprite.texture =
			texture;
		this.#sprite.scale.set(
			0.1,
		);
		this.#updatePosition(
			material.position,
		);
		parent.addChild(
			this
				.#container,
		);
		layer.attach(
			this
				.#container,
		);
	}

	update(
		material: Material,
		deltaTime: DeltaTime,
	): void {
		this.#updatePosition(
			material.position,
		);
	}

	remove() {
		this.#container.parent?.removeChild(
			this
				.#container,
		);
	}

	#updatePosition(
		position: Position,
	) {
		this.#container.x =
			position.x;
		this.#container.y =
			position.y;
	}
}
