import type { DeltaTime } from "@/time";

/**
 * Tracks elapsed time and advances a frame index for animations.
 * Returns only the frame index — callers compute transforms from it.
 */
export class FrameAnimationController {
	readonly #framesCount: number;
	readonly #frameDuration: number;
	readonly #cycle: boolean;
	#frameIndex = 0;
	#elapsed = 0;

	constructor(
		framesCount: number,
		frameDuration: number,
		cycle = true,
	) {
		this.#framesCount =
			framesCount;
		this.#frameDuration =
			frameDuration;
		this.#cycle =
			cycle;
	}

	advance(
		delta: DeltaTime,
	): number {
		this.#elapsed +=
			delta *
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
		return this
			.#frameIndex;
	}

	get frameIndex(): number {
		return this
			.#frameIndex;
	}

	get framesCount(): number {
		return this
			.#framesCount;
	}
}
