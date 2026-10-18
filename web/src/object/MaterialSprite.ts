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

/** Size of the material crystal in the objects atlas */
export const materialTextureSize =
	textureSize;

const textureScale = 0.1;

/** Size of the material crystal on the playing field */
export const materialDisplaySize =
	{
		width:
			textureSize.width *
			textureScale,
		height:
			textureSize.height *
			textureScale,
	};

/** Offset from a material position to the visual center of its crystal */
export const materialVisualCenterOffset =
	{
		x:
			(materialDisplaySize.width -
				size.width) /
			2,
		y:
			(materialDisplaySize.height -
				size.height) /
			2,
	};

/** The material crystal from the objects atlas, also used by the UI. */
export async function loadMaterialTexture() {
	const source =
		await Assets.get(
			"objects",
		);
	return new PIXI.Texture(
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
}

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
		this.#sprite.texture =
			await loadMaterialTexture();
		this.#sprite.scale.set(
			textureScale,
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
		_deltaTime: DeltaTime,
	): void {
		this.updatePosition(
			material.position,
		);
	}
}
