import * as PIXI from "pixi.js";

/**
 * Provides a simple frame-based animation for a base texture.
 * Usage: create with number of frames, base texture, and a frame drawing function.
 */
export class AnimatedSprite<R extends PIXI.TextureSource = PIXI.TextureSource> {
	#framesCount: number;
	#drawFrame: (frameIdx: number) => PIXI.Texture<R> | Promise<PIXI.Texture<R>>;
	#frameIndex = 0;
	#elapsed = 0;
	#frameDuration: number;
	#cycle: boolean;

	/**
	 * @param framesCount Number of frames in the animation cycle
	 * @param drawFrame Function that returns a cropped texture for a given frame index
	 * @param frameDuration Duration of each frame in milliseconds (default: 100)
	 */
	constructor(
		framesCount: number,
		drawFrame: (frameIdx: number) => PIXI.Texture<R> | Promise<PIXI.Texture<R>>,
		frameDuration = 100,
		cycle = true,
	) {
		this.#framesCount = framesCount;
		this.#drawFrame = drawFrame;
		this.#frameDuration = frameDuration;
		this.#cycle = cycle;
	}

	/**
	 * Returns the texture for the current frame, advancing based on deltaTime (seconds).
	 */
	async getSprite(deltaTime: number): Promise<PIXI.Texture<R>> {
		this.#elapsed += deltaTime * 1000;
		if (this.#elapsed >= this.#frameDuration) {
			this.#frameIndex = this.#frameIndex + 1;
			if (this.#cycle) {
				this.#frameIndex %= this.#framesCount;
			} else {
				this.#frameIndex = Math.min(this.#framesCount - 1, this.#frameIndex);
			}
			this.#elapsed %= this.#frameDuration;
		}
		return this.#drawFrame(this.#frameIndex);
	}
}
