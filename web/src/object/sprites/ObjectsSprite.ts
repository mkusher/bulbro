import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";

export const objects =
	{
		tree: {
			position:
				{
					x: 0,
					y: 0,
				},
			size: {
				width: 146,
				height: 540,
			},
		},
		grass:
			{
				position:
					{
						x: 147,
						y: 0,
					},
				size: {
					width: 146,
					height: 540,
				},
			},
		crystal:
			{
				position:
					{
						x: 294,
						y: 0,
					},
				size: {
					width: 146,
					height: 540,
				},
			},
		stones:
			{
				position:
					{
						x: 441,
						y: 0,
					},
				size: {
					width: 146,
					height: 540,
				},
			},
		sticks:
			{
				position:
					{
						x: 588,
						y: 0,
					},
				size: {
					width: 146,
					height: 540,
				},
			},
		elixir:
			{
				position:
					{
						x: 735,
						y: 0,
					},
				size: {
					width: 146,
					height: 540,
				},
			},
		chest:
			{
				position:
					{
						x: 882,
						y: 0,
					},
				size: {
					width: 142,
					height: 540,
				},
			},
	} as const;

export type ObjectType =
	keyof typeof objects;
export const objectTypes =
	Object.keys(
		objects,
	) as ObjectType[];

export class ObjectsSprite {
	#gfx =
		new PIXI.Sprite();
	#objectType: ObjectType;

	constructor(
		objectType: ObjectType,
	) {
		this.#objectType =
			objectType;
	}

	async init() {
		const fullTexture =
			await Assets.get(
				"objects",
			);
		const objectConfig =
			this
				.#objectConfiguration;
		const objectTexture =
			new PIXI.Texture(
				{
					source:
						fullTexture,
					frame:
						new PIXI.Rectangle(
							objectConfig
								.position
								.x,
							objectConfig
								.position
								.y,
							objectConfig
								.size
								.width,
							objectConfig
								.size
								.height,
						),
				},
			);

		this.#gfx.texture =
			objectTexture;
	}

	get #objectConfiguration() {
		return objects[
			this
				.#objectType
		];
	}

	appendTo(
		container: PIXI.Container,
	) {
		this.remove();
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
