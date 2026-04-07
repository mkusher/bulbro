import * as PIXI from "pixi.js";
import {
	ColorOverlayFilter,
	OutlineFilter,
} from "pixi-filters";
import { ConvolutionFilter } from "pixi-filters/convolution";
import { Assets } from "@/Assets";
import type {
	Direction,
	Position,
	Size,
} from "@/geometry";
import { DebugSprite } from "@/graphics/DebugSprite";
import { FrameAnimationController } from "@/graphics/FrameAnimationController";
import { GameSprite } from "@/graphics/GameSprite";
import { ShadowSprite } from "@/graphics/ShadowSprite";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	EnemySprites,
	type EnemyAnimationState,
} from "../EnemySprites";
import type { EnemyState } from "../EnemyState";
import * as enemiesFrames from "./EnemiesFrames";

type PhysicalRectangle =
	{
		position: Position;
		size: Size;
		offset?: Position;
	};

const DEFAULT_SCALING = 0.3;
const CYCLE_LENGTH = 20;
const DEATH_ROTATIONS = 2;

/**
 * Manages an enemy sprite graphic using persistent display nodes.
 * Animation updates mutate existing Pixi objects instead of swapping containers.
 */
export class BulbaEnemySprite extends GameSprite {
	#enemyRootContainer!: PIXI.Container;
	#swingContainer!: PIXI.Container;
	#scalingContainer!: PIXI.Container;
	#bodySprite!: PIXI.Sprite;
	#outlineFilter!: OutlineFilter;
	#hitFilter!: ConvolutionFilter;
	#rageFilter!: ColorOverlayFilter;
	#normalFilters!: PIXI.Filter[];
	#hitFilters!: PIXI.Filter[];
	#rageFilters!: PIXI.Filter[];
	readonly #deadFilters: PIXI.Filter[] =
		[];
	#debugSprite?: DebugSprite;
	#enemySprites!: EnemySprites;
	#shadow: ShadowSprite;
	#defaultFrame: PhysicalRectangle;

	constructor(
		type: enemiesFrames.EnemyType,
		debug?: boolean,
	) {
		super(
			{
				anchor:
					"bottom-center",
				direction:
					{
						type: "flip",
					},
			},
		);
		this.#defaultFrame =
			enemiesFrames[
				type
			];
		const size =
			this
				.#defaultFrame
				.size;
		const scaledSize =
			{
				width:
					size.width *
					DEFAULT_SCALING,
				height:
					size.height *
					DEFAULT_SCALING,
			};
		this.#shadow =
			new ShadowSprite(
				scaledSize,
			);
		if (
			debug
		) {
			this.#debugSprite =
				new DebugSprite(
					scaledSize,
					{
						anchor:
							"bottom-center",
					},
				);
		}
		this.init();
	}

	async init(): Promise<void> {
		const texture =
			await this.#buildBodyTexture(
				this
					.#defaultFrame,
			);

		this.#bodySprite =
			new PIXI.Sprite(
				texture,
			);
		this.#bodySprite.scale.x =
			-Math.abs(
				this
					.#bodySprite
					.scale
					.x,
			);

		this.#scalingContainer =
			new PIXI.Container();
		this.#scalingContainer.scale.set(
			DEFAULT_SCALING,
		);
		this.#scalingContainer.addChild(
			this
				.#bodySprite,
		);

		const scaledWidth =
			this
				.#defaultFrame
				.size
				.width *
			DEFAULT_SCALING;
		const scaledHeight =
			this
				.#defaultFrame
				.size
				.height *
			DEFAULT_SCALING;
		this.#scalingContainer.y =
			-scaledHeight;
		this.#scalingContainer.x =
			scaledWidth /
			2;

		// #swingContainer sits at the feet (y=0). Scaling it keeps the bottom
		// anchored at y=0, matching the original behaviour where swing was
		// applied to the outer container whose origin was at feet level.
		this.#swingContainer =
			new PIXI.Container();
		this.#swingContainer.addChild(
			this
				.#scalingContainer,
		);

		this.#enemyRootContainer =
			new PIXI.Container();
		this.#enemyRootContainer.addChild(
			this
				.#swingContainer,
		);

		this.#outlineFilter =
			new OutlineFilter(
				3,
				0x000000,
				1.0,
			);
		this.#hitFilter =
			new ConvolutionFilter();
		this.#rageFilter =
			new ColorOverlayFilter(
				0xff0000,
				0.85,
			);

		this.#normalFilters =
			[
				this
					.#outlineFilter,
			];
		this.#hitFilters =
			[
				this
					.#outlineFilter,
				this
					.#hitFilter,
			];
		this.#rageFilters =
			[
				this
					.#outlineFilter,
				this
					.#rageFilter,
			];

		this.#enemyRootContainer.filters =
			this.#normalFilters;

		this.#enemySprites =
			new EnemySprites(
				{
					idle: {
						controller:
							new FrameAnimationController(
								CYCLE_LENGTH,
								30,
							),
						swingAmplitude: 0.2,
						dimensions:
							{
								x:
									-0.8,
								y: 1,
							},
					},
					walking:
						{
							controller:
								new FrameAnimationController(
									CYCLE_LENGTH,
									15,
								),
							swingAmplitude: 0.3,
							dimensions:
								{
									x: 0.6,
									y: 1,
								},
						},
					hurt: {
						controller:
							new FrameAnimationController(
								CYCLE_LENGTH,
								50,
							),
						swingAmplitude: 0.4,
						dimensions:
							{
								x: 0.6,
								y: 1,
							},
					},
					hurtALot:
						{
							controller:
								new FrameAnimationController(
									CYCLE_LENGTH,
									60,
								),
							swingAmplitude: 0.4,
							dimensions:
								{
									x: 0,
									y: 1,
								},
						},
					raging:
						{
							controller:
								new FrameAnimationController(
									CYCLE_LENGTH,
									750,
								),
							swingAmplitude: 0.3,
							dimensions:
								{
									x:
										-0.8,
									y: 1,
								},
						},
					dead: {
						controller:
							new FrameAnimationController(
								CYCLE_LENGTH,
								20,
								false,
							),
						rotationsPerAnimation:
							DEATH_ROTATIONS,
					},
				},
			);

		this.#shadow.appendTo(
			this
				.container,
		);
		this.addChild(
			this
				.#enemyRootContainer,
		);
		if (
			this
				.#debugSprite
		) {
			this.#debugSprite.appendTo(
				this
					.container,
			);
		}
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	override appendTo(
		parent: PIXI.Container,
		layer: PIXI.RenderLayer,
	): void {
		super.appendTo(
			parent,
			layer,
		);
	}

	update(
		enemy: EnemyState,
		delta: DeltaTime,
		now: NowTime,
	) {
		if (
			!this
				.#enemySprites
		)
			return;

		this.#shadow.visible =
			!enemy.killedAt;

		const shape =
			enemy.toMovableObject();
		const rectangle =
			shape
				.shape
				.type ===
			"rectangle"
				? shape.shape
				: (() => {
						throw new Error(
							"Is not supported",
						);
					})();

		this.#updateSpritePosition(
			enemy.position,
			rectangle,
			enemy.lastDirection,
		);

		if (
			this
				.#debugSprite
		) {
			this.#debugSprite?.update(
				rectangle,
			);
		}

		const state =
			this.#enemySprites.getState(
				enemy,
				delta,
				now,
			);
		this.#applyAnimationState(
			state,
		);
	}

	#updateSpritePosition(
		pos: Position,
		_size: Size,
		lastDirection?: Direction,
	): void {
		this.updatePosition(
			pos,
			lastDirection,
		);
	}

	#applyAnimationState(
		state: EnemyAnimationState,
	): void {
		if (
			!this
				.#enemyRootContainer
		)
			return;

		// Apply swing/death transforms to #swingContainer whose origin is at
		// the feet (y=0). This keeps the bottom of the sprite anchored while
		// the body squashes/stretches upward, matching the original behaviour.
		const effectiveScale =
			state.overallScale;
		this.#swingContainer.scale.x =
			state.scaleX *
			effectiveScale;
		this.#swingContainer.scale.y =
			state.scaleY *
			effectiveScale;
		this.#swingContainer.rotation =
			state.rotation;

		switch (
			state.effect
		) {
			case "hit": {
				const f =
					state.hitFactor;
				this.#hitFilter.matrix =
					new Float32Array(
						[
							0,
							f,
							0,
							f,
							1,
							f,
							0,
							f,
							0,
						],
					);
				this.#enemyRootContainer.filters =
					this.#hitFilters;
				break;
			}
			case "rage": {
				this.#enemyRootContainer.filters =
					state.showRageOverlay
						? this
								.#rageFilters
						: this
								.#normalFilters;
				break;
			}
			default: {
				this.#enemyRootContainer.filters =
					state.kind ===
					"dead"
						? this
								.#deadFilters
						: this
								.#normalFilters;
			}
		}
	}

	async #buildBodyTexture(
		rectangle: PhysicalRectangle,
	): Promise<PIXI.Texture> {
		const source =
			await Assets.get(
				"allEnemies",
			);
		return new PIXI.Texture(
			{
				source,
				frame:
					new PIXI.Rectangle(
						rectangle
							.position
							.x,
						rectangle
							.position
							.y,
						rectangle
							.size
							.width,
						rectangle
							.size
							.height,
					),
			},
		);
	}
}
