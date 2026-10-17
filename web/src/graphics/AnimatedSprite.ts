import * as PIXI from "pixi.js";
import type { DeltaTime } from "@/time";

/**
 * Provides a simple frame-based animation for a base texture.
 * Usage: create with number of frames, base texture, and a frame drawing function.
 */
export class AnimatedSprite<
	R extends
		| PIXI.Texture
		| PIXI.Sprite
		| PIXI.Container = PIXI.Texture,
> {
	#framesCount: number;
	#drawFrame: (
		frameIdx: number,
	) =>
		| R
		| Promise<R>;
	#frameIndex = 0;
	#elapsed = 0;
	#frameDuration: number;
	#cycle: boolean;
	#frameCache =
		new Map<
			number,
			R
		>();
	#pendingFrames =
		new Map<
			number,
			Promise<R>
		>();
	#destroyOptions?: PIXI.DestroyOptions;

	/**
	 * @param framesCount Number of frames in the animation cycle
	 * @param drawFrame Function that returns a cropped texture for a given frame index
	 * @param frameDuration Duration of each frame in milliseconds (default: 100)
	 */
	constructor(
		framesCount: number,
		drawFrame: (
			frameIdx: number,
		) =>
			| R
			| Promise<R>,
		frameDuration = 100,
		cycle = true,
	) {
		this.#framesCount =
			framesCount;
		this.#drawFrame =
			drawFrame;
		this.#frameDuration =
			frameDuration;
		this.#cycle =
			cycle;
	}

	/**
	 * Returns the texture for the current frame, advancing based on deltaTime (seconds).
	 */
	async getSprite(
		deltaTime: DeltaTime,
	): Promise<R> {
		this.#elapsed +=
			deltaTime *
			1000;
		if (
			this
				.#elapsed >=
			this
				.#frameDuration
		) {
			this.#frameIndex =
				this
					.#frameIndex +
				1;
			if (
				this
					.#cycle
			) {
				this.#frameIndex %=
					this.#framesCount;
			} else {
				this.#frameIndex =
					Math.min(
						this
							.#framesCount -
							1,
						this
							.#frameIndex,
					);
			}
			this.#elapsed %=
				this.#frameDuration;
		}
		const cached =
			this.#frameCache.get(
				this
					.#frameIndex,
			);
		if (
			cached
		)
			return cached;

		const frameIndex =
			this
				.#frameIndex;
		// Ticks keep asking for the frame while it is drawn, build it only once
		const pending =
			this.#pendingFrames.get(
				frameIndex,
			) ??
			this.#drawAndCache(
				frameIndex,
			);
		return pending;
	}

	#drawAndCache(
		frameIndex: number,
	): Promise<R> {
		const pending =
			(async () => {
				const result =
					await Promise.resolve(
						this.#drawFrame(
							frameIndex,
						),
					).finally(
						() =>
							this.#pendingFrames.delete(
								frameIndex,
							),
					);
				// A frame finished after destroy() would never be freed otherwise
				if (
					this
						.#destroyOptions
				) {
					this.#destroyFrame(
						result,
						this
							.#destroyOptions,
					);
				} else {
					this.#frameCache.set(
						frameIndex,
						result,
					);
				}
				return result;
			})();
		this.#pendingFrames.set(
			frameIndex,
			pending,
		);
		return pending;
	}

	/** Destroys every cached frame and any frame still being drawn. */
	destroy(
		options: PIXI.DestroyOptions = {
			children: true,
		},
	) {
		this.#destroyOptions =
			options;
		for (const frame of this.#frameCache.values()) {
			this.#destroyFrame(
				frame,
				options,
			);
		}
		this.#frameCache.clear();
	}

	#destroyFrame(
		frame: R,
		options: PIXI.DestroyOptions,
	) {
		if (
			frame instanceof
			PIXI.Container
		) {
			frame.destroy(
				options,
			);
		} else {
			frame.destroy(
				false,
			);
		}
	}
}
