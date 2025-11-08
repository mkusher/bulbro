import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";
import {
	type Point,
	type Position,
	type Size,
	zeroPoint,
} from "@/geometry";

type FaceDefinition =
	{
		position: Position;
		size: Size;
		offset?: Position;
		rotation?: number;
		scale?:
			| number
			| Point;
	};

export const faces =
	{
		normal:
			{
				position:
					{
						x: 236,
						y: 186,
					},
				size: {
					width: 71,
					height: 65,
				},
				offset:
					{
						x: 25,
						y: 40,
					},
				scale: 0.9,
			},
		evil: {
			position:
				{
					x: 240,
					y: 93,
				},
			size: {
				width: 50,
				height: 50,
			},
			offset:
				{
					x: 35,
					y: 40,
				},
		},
		vampire:
			{
				position:
					{
						x: 314,
						y: 86,
					},
				size: {
					width: 84,
					height: 90,
				},
				offset:
					{
						x: 25,
						y: 20,
					},
				scale: 0.85,
			},
		old: {
			position:
				{
					x: 418,
					y: 73,
				},
			size: {
				width: 151,
				height: 110,
			},
			offset:
				{
					x:
						-10,
					y: 30,
				},
			scale: 0.75,
		},
		crazy:
			{
				position:
					{
						x: 395,
						y: 198,
					},
				size: {
					width: 188,
					height: 132,
				},
				offset:
					{
						x:
							-30,
						y: 25,
					},
				scale: 0.7,
			},
		cyborg:
			{
				position:
					{
						x: 430,
						y: 350,
					},
				size: {
					width: 135,
					height: 75,
				},
				offset:
					{
						x:
							-15,
						y: 35,
					},
				scale: 0.75,
			},
	} as const satisfies Record<
		string,
		FaceDefinition
	>;

export type FaceType =
	keyof typeof faces;
export const faceTypes =
	Object.keys(
		faces,
	) as FaceType[];

export class FaceSprite {
	#gfx =
		new PIXI.Sprite();
	#faceType: FaceType;

	constructor(
		faceType: FaceType,
	) {
		this.#faceType =
			faceType;
	}
	async init() {
		const fullTexture =
			await Assets.get(
				"bulbroHeroes",
			);
		const face =
			new PIXI.Texture(
				{
					source:
						fullTexture,
					frame:
						new PIXI.Rectangle(
							this
								.#faceConfiguration
								.position
								.x,
							this
								.#faceConfiguration
								.position
								.y,
							this
								.#faceConfiguration
								.size
								.width,
							this
								.#faceConfiguration
								.size
								.height,
						),
				},
			);
		face.source.scaleMode =
			"linear";
		this.#gfx.texture =
			face;
	}

	get #faceConfiguration() {
		return faces[
			this
				.#faceType
		];
	}

	appendTo(
		container: PIXI.Container,
		bodySize: Size,
	) {
		container.addChild(
			this
				.#gfx,
		);
		const config =
			this
				.#faceConfiguration as FaceDefinition;
		const offset =
			config.offset ||
			zeroPoint();
		this.#gfx.position.x =
			offset.x;
		this.#gfx.position.y =
			offset.y;
		if (
			config.scale
		) {
			this.#gfx.scale =
				config.scale;
		}
	}
}
