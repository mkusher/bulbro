import * as PIXI from "pixi.js";
import { ColorOverlayFilter } from "pixi-filters";
import { ConvolutionFilter } from "pixi-filters/convolution";
import { Assets } from "@/Assets";
import type {
	Direction,
	Position,
	Size,
} from "@/geometry";
import type { AnimatedSprite } from "@/graphics/AnimatedSprite";
import { GameSprite } from "@/graphics/GameSprite";
import { Rectangle as RectangleGfx } from "@/graphics/Rectangle";
import { RotatingDisapperanceAnimation } from "@/graphics/RotatingDisappearanceAnimation";
import { SwingingAnimation } from "@/graphics/SwingingAnimation";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { deltaTime } from "@/time";
import { EnemySprites } from "../EnemySprites";
import type { EnemyState } from "../EnemyState";
import * as enemiesFrames from "./EnemiesFrames";

type PhysicalRectangle =
	{
		position: Position;
		size: Size;
		offset?: Position;
	};

/**
 * Manages an enemy sprite graphic.
 */
export class BulbaEnemySprite extends GameSprite {
	#sprite!: PIXI.Container;
	#debugSprite?: RectangleGfx;
	#movement?: AnimatedSprite<PIXI.Container>;
	#idle?: AnimatedSprite<PIXI.Container>;
	#dead?: AnimatedSprite<PIXI.Container>;
	#whenHit?: AnimatedSprite<PIXI.Container>;
	#whenDangerouslyHit?: AnimatedSprite<PIXI.Container>;
	#raging?: AnimatedSprite<PIXI.Container>;
	#enemySprites?: EnemySprites<PIXI.Container>;
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
		if (
			debug
		) {
			this.#debugSprite =
				new RectangleGfx(
					size,
					0xff00ff,
					0.9,
				);
		}
		this.init();
	}

	#fullTexture() {
		return Assets.get(
			"allEnemies",
		);
	}

	async init() {
		this.#idle =
			this.#createSwingingAnimation(
				[
					this
						.#defaultFrame,
				],
				30,
				0.2,
				{
					x:
						-0.8,
					y: 1,
				},
			);
		this.#movement =
			this.#createSwingingAnimation(
				[
					this
						.#defaultFrame,
				],
				15,
				0.3,
				{
					x: 0.6,
					y: 1,
				},
			);
		this.#whenHit =
			this.#createHitSprite(
				50,
				0.4,
				{
					x: 0.6,
					y: 1,
				},
			);

		this.#whenDangerouslyHit =
			this.#createSwingingAnimation(
				[
					this
						.#defaultFrame,
				],
				60,
				0.4,
			);
		this.#dead =
			this.#createDeathAnimation(
				[
					this
						.#defaultFrame,
				],
			);
		this.#raging =
			this.#createRagingAnimation();

		this.#enemySprites =
			new EnemySprites(
				{
					walking:
						this
							.#movement,
					hurt: this
						.#whenHit,
					hurtALot:
						this
							.#whenDangerouslyHit,
					idle: this
						.#idle,
					dead: this
						.#dead,
				},
				this
					.#raging,
			);

		this.#sprite =
			await this.#idle.getSprite(
				deltaTime(
					0,
				),
			);
		this.addChild(
			this
				.#sprite,
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
				0xff00ff,
				0.9,
			);
			this.#debugSprite.position.y =
				-rectangle.height;
			this.#debugSprite.position.x =
				-rectangle.width /
				2;
		}

		this.#enemySprites
			?.getSprite(
				enemy,
				delta,
				now,
			)
			.then(
				(
					sprite,
				) => {
					if (
						sprite
					) {
						if (
							this
								.#sprite
						) {
							this.#sprite?.removeFromParent();
						}
						this.#sprite =
							sprite;
						this.addChild(
							sprite,
						);
						this.#updateSpritePosition(
							enemy.position,
							rectangle,
							enemy.lastDirection,
						);
					}
				},
			);
	}

	#updateSpritePosition(
		pos: Position,
		size: Size,
		lastDirection?: Direction,
	): void {
		this.updatePosition(
			pos,
			lastDirection,
		);

		if (
			!this
				.#sprite
		) {
			return;
		}
	}

	#createSwingingAnimation(
		body: PhysicalRectangle[],
		amplitude: number,
		frameSpeed: number,
		dimensions?: Position,
	) {
		const indexInArray =
			(
				length: number,
				frame: number,
				changeEach: number = 1,
			) =>
				Math.floor(
					frame /
						changeEach,
				) %
				length;
		const swingingWalk =
			new SwingingAnimation(
				(
					frame,
				) =>
					this.#buildEnemy(
						body[
							indexInArray(
								body.length,
								frame,
								10,
							)
						]!,
					),
				amplitude,
				frameSpeed,
				dimensions,
			);
		return swingingWalk.createAnimatedSprite();
	}

	#createDeathAnimation(
		body: PhysicalRectangle[],
	) {
		const indexInArray =
			(
				length: number,
				frame: number,
				changeEach: number = 1,
			) =>
				Math.floor(
					frame /
						changeEach,
				) %
				length;
		const animation =
			new RotatingDisapperanceAnimation(
				(
					frame,
				) =>
					this.#buildEnemy(
						body[
							indexInArray(
								body.length,
								frame,
								10,
							)
						]!,
					),
				20,
				2,
			);
		return animation.createAnimatedSprite();
	}

	#createHitSprite(
		amplitude: number,
		frameSpeed: number,
		dimensions?: Position,
	) {
		const swingingWalk =
			new SwingingAnimation(
				async (
					frame,
				) => {
					const sprite =
						await this.#buildEnemy(
							this
								.#defaultFrame,
						);
					const factor =
						0.5 +
						frame *
							0.1;
					const matrix =
						[
							0,
							factor,
							0,
							factor,
							1,
							factor,
							0,
							factor,
							0,
						];
					const conv =
						new ConvolutionFilter(
							matrix,
						);
					sprite.filters =
						[
							conv,
						];
					return sprite;
				},
				amplitude,
				frameSpeed,
				dimensions,
			);
		return swingingWalk.createAnimatedSprite();
	}

	#createRagingAnimation() {
		const swingingWalk =
			new SwingingAnimation(
				async (
					frame,
				) => {
					const sprite =
						await this.#buildEnemy(
							this
								.#defaultFrame,
						);
					const shouldShowOverlay =
						frame %
							2 ===
						0;
					if (
						shouldShowOverlay
					) {
						const colorOverlay =
							new ColorOverlayFilter(
								0xff0000,
								0.85,
							);
						sprite.filters =
							[
								colorOverlay,
							];
					}
					return sprite;
				},
				750,
				0.3,
				{
					x:
						-0.8,
					y: 1,
				},
			);
		return swingingWalk.createAnimatedSprite();
	}

	async #buildEnemy(
		rectangle: PhysicalRectangle,
	) {
		const container =
			new PIXI.Container();
		const scaling =
			new PIXI.Container();
		scaling.scale = 0.25;
		scaling.addChild(
			await this.#cutRectangle(
				rectangle,
			),
		);

		container.addChild(
			scaling,
		);
		scaling.y =
			-container.height;
		scaling.x =
			container.width /
			2;
		return container;
	}

	async #cutRectangle(
		rectangle: PhysicalRectangle,
	) {
		const source =
			await this.#fullTexture();
		const texture =
			new PIXI.Texture(
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
		const sprite =
			new PIXI.Sprite(
				{
					texture,
				},
			);
		sprite.scale.x =
			-1 *
			Math.abs(
				sprite
					.scale
					.x,
			);
		return sprite;
	}
}
