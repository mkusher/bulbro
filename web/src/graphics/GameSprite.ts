import * as PIXI from "pixi.js";
import type {
	Direction,
	Position,
	Size,
} from "@/geometry";

/**
 * Anchor point determines how the sprite is positioned relative to the game coordinates.
 * - "bottom-center": Sprite is anchored at the bottom center (feet position for characters)
 * - "center": Sprite is anchored at the center (for projectiles, effects, collectibles)
 * - "top-left": Sprite is anchored at top-left corner (for tiles, backgrounds)
 */
export type AnchorPoint =
	| "center"
	| "bottom-center"
	| "top-left";

/**
 * Direction strategy determines how the sprite responds to direction changes.
 * - "flip": Flips the sprite horizontally based on direction.x (for characters)
 * - "rotate": Rotates the sprite to face the direction (for projectiles)
 * - "none": No direction handling
 */
export type DirectionStrategy =
	| {
			type: "flip";
	  }
	| {
			type: "rotate";
	  }
	| {
			type: "none";
	  };

export interface GameSpriteConfig {
	anchor: AnchorPoint;
	direction?: DirectionStrategy;
}

/**
 * Base class for all game entity sprites.
 * Provides unified coordinate translation from game coordinates to canvas coordinates.
 *
 * The coordinate translation happens through PixiJS's container hierarchy:
 * 1. Camera applies global scale and offset to the stage
 * 2. GameSprite positions its container using raw game coordinates
 * 3. Internal sprite content uses anchor-based offsets for visual positioning
 */
export abstract class GameSprite {
	readonly #container: PIXI.Container;
	readonly #config: Required<GameSpriteConfig>;

	constructor(
		config: GameSpriteConfig,
	) {
		this.#container =
			new PIXI.Container();
		this.#config =
			{
				direction:
					{
						type: "none",
					},
				...config,
			};
	}

	/**
	 * The main container for this sprite.
	 * All visual elements should be added as children of this container.
	 */
	protected get container(): PIXI.Container {
		return this
			.#container;
	}

	/**
	 * The current configuration for this sprite.
	 */
	protected get config(): Required<GameSpriteConfig> {
		return this
			.#config;
	}

	/**
	 * Updates the sprite's position in game coordinates.
	 * This is the primary method for coordinate translation.
	 *
	 * @param position - Game world position
	 * @param direction - Optional direction for flip/rotate handling
	 */
	protected updatePosition(
		position: Position,
		direction?: Direction,
	): void {
		this.#container.x =
			position.x;
		this.#container.y =
			position.y;
		this.#applyDirectionStrategy(
			direction,
		);
	}

	/**
	 * Calculates the offset for internal sprite content based on the anchor point.
	 * Use this to position the visual sprite within the container.
	 *
	 * @param size - The size of the sprite content
	 * @returns The offset to apply to the internal sprite
	 */
	protected calculateAnchorOffset(
		size: Size,
	): Position {
		switch (
			this
				.#config
				.anchor
		) {
			case "bottom-center":
				return {
					x:
						-size.width /
						2,
					y:
						-size.height,
				};
			case "center":
				return {
					x:
						-size.width /
						2,
					y:
						-size.height /
						2,
				};
			case "top-left":
				return {
					x: 0,
					y: 0,
				};
		}
	}

	#applyDirectionStrategy(
		direction?: Direction,
	): void {
		if (
			!direction
		) {
			return;
		}
		if (
			this
				.#config
				.direction
				.type ===
			"none"
		) {
			return;
		}

		if (
			this
				.#config
				.direction
				.type ===
			"flip"
		) {
			if (
				direction.x <
				0
			) {
				this.#container.scale.x =
					-Math.abs(
						this
							.#container
							.scale
							.x,
					);
			} else if (
				direction.x >
				0
			) {
				this.#container.scale.x =
					Math.abs(
						this
							.#container
							.scale
							.x,
					);
			}
		} else if (
			this
				.#config
				.direction
				.type ===
			"rotate"
		) {
			this.#container.rotation =
				Math.atan2(
					direction.y,
					direction.x,
				);
		}
	}

	/**
	 * Adds this sprite to a parent container and optionally a render layer.
	 */
	appendTo(
		parent: PIXI.Container,
		layer?: PIXI.RenderLayer,
	): void {
		parent.addChild(
			this
				.#container,
		);
		layer?.attach(
			this
				.#container,
		);
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#container.removeFromParent();
	}

	/**
	 * Adds a child to this sprite's container.
	 */
	protected addChild(
		child: PIXI.ContainerChild,
	): void {
		this.#container.addChild(
			child,
		);
	}
}
