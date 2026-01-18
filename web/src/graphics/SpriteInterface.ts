import type * as PIXI from "pixi.js";
import type {
	DeltaTime,
	NowTime,
} from "@/time";

/**
 * Common interface for all game entity sprites.
 *
 * This interface defines the standard lifecycle and rendering methods
 * that all game sprites must implement. It provides a unified contract
 * for managing sprites throughout their lifecycle.
 *
 * @template TState - The state type this sprite renders (e.g., EnemyState, BulbroState)
 */
export interface GameSpriteInterface<
	TState,
> {
	/**
	 * Initializes the sprite, loading any required assets.
	 * Must be called before the sprite can be rendered.
	 */
	init(
		...args: unknown[]
	): Promise<void>;

	/**
	 * Adds this sprite to a parent container and render layer.
	 * @param parent - The PIXI container to add this sprite to
	 * @param layer - The render layer for z-ordering
	 */
	appendTo(
		parent: PIXI.Container,
		layer: PIXI.RenderLayer,
	): void;

	/**
	 * Updates the sprite based on the current state.
	 * Called every frame to sync visual representation with game state.
	 *
	 * @param state - The current state of the entity
	 * @param delta - Time elapsed since last frame
	 * @param now - Current game time (optional)
	 */
	update(
		state: TState,
		delta: DeltaTime,
		now?: NowTime,
	): void;

	/**
	 * Removes this sprite from its parent container.
	 * Should clean up any resources and event listeners.
	 */
	remove(): void;
}
