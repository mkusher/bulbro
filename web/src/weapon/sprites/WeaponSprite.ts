import * as PIXI from "pixi.js";
import { OutlineFilter } from "pixi-filters/outline";
import { Assets } from "@/Assets";
import {
	type Direction,
	isEqual,
	type Point,
	type Position,
	rotation,
	type Size,
	zeroPoint,
} from "@/geometry";
import type { WeaponType } from "@/weapon";

type TextureConfig =
	{
		position: Position;
		size: Size;
		scale?:
			| number
			| Point;
	};

const empty =
	{
		position:
			{
				x: 0,
				y: 0,
			},
		size: {
			width: 0,
			height: 0,
		},
	} as const;

export const weapons: Record<
	WeaponType,
	TextureConfig
> =
	{
		hand: {
			position:
				{
					x: 0,
					y: 40,
				},
			size: {
				width: 145,
				height: 110,
			},
		},
		fist: {
			position:
				{
					x: 235,
					y: 20,
				},
			size: {
				width: 155,
				height: 145,
			},
		},
		pistol:
			{
				position:
					{
						x: 480,
						y: 20,
					},
				size: {
					width: 225,
					height: 165,
				},
			},
		smg: {
			position:
				{
					x: 760,
					y: 10,
				},
			size: {
				width: 220,
				height: 195,
			},
		},
		laserGun:
			{
				position:
					{
						x: 76,
						y: 200,
					},
				size: {
					width: 215,
					height: 170,
				},
			},
		knife:
			{
				position:
					{
						x: 28,
						y: 428,
					},
				size: {
					width: 290,
					height: 100,
				},
			},
		sword:
			{
				position:
					{
						x: 330,
						y: 260,
					},
				size: {
					width: 285,
					height: 155,
				},
			},
		ak47: {
			position:
				{
					x: 660,
					y: 238,
				},
			size: {
				width: 345,
				height: 137,
			},
		},
		doubleBarrelShotgun:
			{
				position:
					{
						x: 640,
						y: 370,
					},
				size: {
					width: 350,
					height: 160,
				},
			},
		brick:
			empty,
		orcGun:
			empty,
		enemyGun:
			empty,
		enemyFist:
			empty,
	} as const;

export const weaponTypes =
	Object.keys(
		weapons,
	) as WeaponType[];

type Scaling =
	| 0.125
	| 0.25
	| 0.5
	| 1;

/**
 * Manages a weapon sprite graphic.
 *
 * Uses a two-container hierarchy to separate position and rotation:
 * - #positionContainer: Handles position only (x, y)
 * - #rotationContainer: Handles rotation only (rotation, scale.y for flip)
 *
 * This ensures that rotation doesn't affect the weapon's position,
 * keeping the Bulbro's visual position stable during weapon aiming.
 */
export class WeaponSprite {
	#positionContainer =
		new PIXI.Container();
	#rotationContainer =
		new PIXI.Container();
	#sprite =
		new PIXI.Sprite();
	#weaponType: WeaponType;
	#scaling: Scaling;

	constructor(
		weaponType: WeaponType,
		scaling: Scaling = 0.5,
	) {
		this.#scaling =
			scaling;
		this.#weaponType =
			weaponType;

		// Build hierarchy: positionContainer → rotationContainer → sprite
		this.#rotationContainer.addChild(
			this
				.#sprite,
		);
		this.#positionContainer.addChild(
			this
				.#rotationContainer,
		);
	}

	async init() {
		const assetName =
			this
				.#scaling ===
			1
				? "weapons"
				: this
							.#scaling ===
						0.5
					? "weaponsx05"
					: this
								.#scaling ===
							0.25
						? "weaponsx025"
						: "weaponsx0125";
		const fullTexture =
			await Assets.get(
				assetName,
				{
					scaleMode:
						"linear",
				},
			);
		const weaponConfig =
			this
				.#weaponConfiguration;
		const weaponTexture =
			new PIXI.Texture(
				{
					source:
						fullTexture,
					frame:
						new PIXI.Rectangle(
							weaponConfig
								.position
								.x *
								this
									.#scaling,
							weaponConfig
								.position
								.y *
								this
									.#scaling,
							weaponConfig
								.size
								.width *
								this
									.#scaling,
							weaponConfig
								.size
								.height *
								this
									.#scaling,
						),
				},
			);

		this.#sprite.texture =
			weaponTexture;
		this.#sprite.anchor.set(
			0.5,
		);

		const outlineFilter =
			new OutlineFilter(
				2,
				0x000000,
				1.0,
			);

		this.#sprite.filters =
			[
				outlineFilter,
			];
	}

	get #weaponConfiguration() {
		return weapons[
			this
				.#weaponType
		];
	}

	appendTo(
		container: PIXI.Container,
	) {
		this.remove();
		container.addChild(
			this
				.#positionContainer,
		);

		const weaponConfig =
			this
				.#weaponConfiguration;

		if (
			weaponConfig.scale
		) {
			this.#positionContainer.scale =
				weaponConfig.scale;
		}
	}

	remove() {
		this.#positionContainer.removeFromParent();
	}

	/**
	 * Updates the weapon's position.
	 * Position is applied to the outer container only.
	 */
	updatePosition(
		x: number,
		y: number,
	) {
		this.#positionContainer.x =
			x;
		this.#positionContainer.y =
			y;
	}

	/**
	 * Rotates the weapon to aim in a direction.
	 * Rotation is applied to the inner container only,
	 * ensuring position remains stable.
	 */
	aim(
		direction: Direction,
	) {
		if (
			isEqual(
				direction,
				zeroPoint(),
			)
		) {
			this.#rotationContainer.rotation = 0;
		} else {
			this.#rotationContainer.rotation =
				rotation(
					direction,
				) -
				Math.PI /
					2;
		}

		// Handle horizontal flip based on aim direction
		this.#rotationContainer.scale.y =
			Math.abs(
				this
					.#rotationContainer
					.scale
					.y,
			);
		if (
			direction.x <
			0
		) {
			this.#rotationContainer.scale.y *=
				-1;
		}
	}
}
