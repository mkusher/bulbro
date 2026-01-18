import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";
import { GameSprite } from "@/graphics/GameSprite";
import type { DeltaTime } from "@/time";
import type { Material } from "./MaterialState";

const size =
	{
		width: 50,
		height: 50,
	};

const textureSize =
	{
		width: 200,
		height: 265,
	};

export class MaterialSprite extends GameSprite {
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;

	constructor(
		debug: boolean,
	) {
		super(
			{
				anchor:
					"center",
				direction:
					{
						type: "none",
					},
			},
		);
		this.#sprite =
			new PIXI.Sprite();
		this.addChild(
			this
				.#sprite,
		);

		// Apply anchor offset for visual centering
		const offset =
			this.calculateAnchorOffset(
				size,
			);
		this.#sprite.x =
			offset.x;
		this.#sprite.y =
			offset.y;

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
			this.addChild(
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
							textureSize.width,
							textureSize.height,
						),
				},
			);
		this.#sprite.texture =
			texture;
		this.#sprite.scale.set(
			0.1,
		);
		this.updatePosition(
			material.position,
		);
		parent.addChild(
			this
				.container,
		);
		layer.attach(
			this
				.container,
		);
	}

	update(
		material: Material,
		deltaTime: DeltaTime,
	): void {
		this.updatePosition(
			material.position,
		);
	}
}
