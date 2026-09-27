import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";
import { GameSprite } from "@/graphics/GameSprite";
import type { DeltaTime } from "@/time";
import type { Consumable } from "./ConsumableState";

const size =
	{
		width: 24,
		height: 40,
	};

const textureSize =
	{
		width: 120,
		height: 200,
	};

export class ConsumableSprite extends GameSprite {
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
				0x00ff00,
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
		consumable: Consumable,
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
							378,
							455,
							textureSize.width,
							textureSize.height,
						),
				},
			);
		this.#sprite.texture =
			texture;
		this.#sprite.scale.set(
			0.2,
		);
		this.updatePosition(
			consumable.position,
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
		consumable: Consumable,
		deltaTime: DeltaTime,
	): void {
		this.updatePosition(
			consumable.position,
		);
	}
}
