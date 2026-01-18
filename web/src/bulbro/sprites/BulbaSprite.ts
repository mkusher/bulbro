import * as PIXI from "pixi.js";
import { OutlineFilter } from "pixi-filters/outline";
import type {
	Direction,
	Position,
} from "@/geometry";
import type { AnimatedSprite } from "@/graphics/AnimatedSprite";
import { CharacterSprites } from "@/graphics/CharacterSprite";
import { GameSprite } from "@/graphics/GameSprite";
import { Rectangle as RectangleGfx } from "@/graphics/Rectangle";
import { SwingingAnimation } from "@/graphics/SwingingAnimation";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import {
	deltaTime,
	nowTime,
} from "@/time";
import { WeaponsSprite } from "@/weapon/sprites/WeaponsSprite.ts";
import type { BulbroState } from "../BulbroState";
import { BodySprite } from "./BodySprite.ts";
import {
	FaceSprite,
	type FaceType,
} from "./FaceSprite.ts";
import { LegsSprite } from "./LegsSprite.ts";

export {
	type FaceType,
	faces,
	faceTypes,
} from "./FaceSprite.ts";

const fullSize =
	{
		width: 190,
		height: 280,
	};

/**
 * Manages a player sprite graphic.
 */
export class BulbaSprite extends GameSprite {
	#sprite!: PIXI.Container;
	#debugSprite?: RectangleGfx;
	#characterScaling = 0.25;
	#weaponsSprite =
		new WeaponsSprite();
	#movement?: AnimatedSprite<PIXI.Container>;
	#idle?: AnimatedSprite<PIXI.Container>;
	#whenHit?: AnimatedSprite<PIXI.Container>;
	#whenDangerouslyHit?: AnimatedSprite<PIXI.Container>;
	#characterSprites?: CharacterSprites<PIXI.Container>;
	#faceType: FaceType;

	constructor(
		faceType: FaceType,
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
		this.#faceType =
			faceType;
		if (
			debug
		) {
			this.#debugSprite =
				new RectangleGfx(
					fullSize,
					0x0000ff,
					0.9,
				);
		}
	}

	async init(
		bulbro: BulbroState,
	) {
		this.#idle =
			this.#createSwingingAnimation(
				80,
				0.1,
			);
		this.#movement =
			this.#createSwingingAnimation(
				40,
				0.2,
			);
		this.#whenHit =
			this.#createSwingingAnimation(
				50,
				0.25,
			);

		this.#whenDangerouslyHit =
			this.#createSwingingAnimation(
				60,
				0.3,
			);

		this.#characterSprites =
			new CharacterSprites(
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
				},
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
		this.update(
			bulbro,
			deltaTime(
				0,
			),
			nowTime(
				0,
			),
		);
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
		player: BulbroState,
		delta: DeltaTime,
		now: NowTime,
	) {
		this.#updateSpritePosition(
			player.position,
			player.lastDirection,
		);

		if (
			this
				.#debugSprite
		) {
			const shape =
				player.toMovableObject();
			const rectangle =
				shape
					.shape
					.type ===
				"rectangle"
					? shape.shape
					: (() => {
							throw new Error(
								"Shape is not supported",
							);
						})();

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
		this.#weaponsSprite.update(
			player,
		);

		this.#characterSprites
			?.getSprite(
				player,
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
						this.#renderCharacterSprite(
							player,
							sprite,
						);
					}
				},
			);
	}

	#renderCharacterSprite =
		(
			player: BulbroState,
			sprite: PIXI.Container,
		) => {
			if (
				this
					.#sprite
			) {
				sprite.x =
					this.#sprite.x;
				sprite.y =
					this.#sprite.y;
				this.#sprite?.removeFromParent();
			}
			this.#sprite =
				sprite;
			this.addChild(
				sprite,
			);
			this.#updateSpritePosition(
				player.position,
				player.lastDirection,
			);
		};

	#updateSpritePosition(
		pos: Position,
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

	/**
	 * Removes this sprite from its parent container.
	 */
	override remove(): void {
		this.#weaponsSprite.remove();
		super.remove();
	}

	#createSwingingAnimation(
		frameSpeed: number,
		amplitude: number,
	) {
		const swinging =
			new SwingingAnimation(
				(
					frame,
				) =>
					this.#buildCharacter(
						frame,
					),
				frameSpeed,
				amplitude,
				{
					x:
						-0.8,
					y: 1,
				},
			);
		return swinging.createAnimatedSprite();
	}

	async #buildCharacter(
		frame: number,
	) {
		const bodySprite =
			new BodySprite();
		const legsSprite =
			new LegsSprite();

		const faceSprite =
			new FaceSprite(
				this
					.#faceType,
			);
		await Promise.all(
			[
				bodySprite.init(),
				legsSprite.init(),
				faceSprite.init(),
			],
		);
		const bodySize =
			bodySprite.size;
		const character =
			new PIXI.Container();
		const weaponsContainer =
			new PIXI.Container();
		const scaling =
			new PIXI.Container();
		scaling.scale =
			this.#characterScaling;
		weaponsContainer.addChild(
			scaling,
		);
		character.addChild(
			weaponsContainer,
		);
		bodySprite.appendTo(
			scaling,
		);
		legsSprite.appendTo(
			scaling,
			bodySize,
		);
		faceSprite.appendTo(
			scaling,
			bodySize,
		);
		scaling.filters =
			[
				new OutlineFilter(
					2,
					0x000000,
					1.0,
				),
			];

		// Add weapons sprite on top of body
		this.#weaponsSprite.appendTo(
			weaponsContainer,
		);

		// Use fixed body dimensions for offset calculation, not dynamic container bounds.
		// Container bounds change when weapons rotate, causing unwanted character movement.
		const scaledBodyHeight =
			bodySize.height *
			this
				.#characterScaling;
		const scaledBodyWidth =
			bodySize.width *
			this
				.#characterScaling;
		weaponsContainer.y =
			-scaledBodyHeight -
			5;
		weaponsContainer.x =
			-scaledBodyWidth /
			2;
		return character;
	}
}
