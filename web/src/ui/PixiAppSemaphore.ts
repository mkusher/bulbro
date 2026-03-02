import * as PIXI from "pixi.js";

export class PixiAppSemaphore {
	#available: number;
	#queue: Array<
		() => void
	> =
		[];
	constructor(
		limit: number,
	) {
		this.#available =
			limit;
	}
	async take(): Promise<PIXI.Application> {
		if (
			this
				.#available <
			1
		) {
			await new Promise<void>(
				(
					resolve,
				) => {
					this.#queue.push(
						resolve,
					);
				},
			);
		}
		this
			.#available--;
		return new PIXI.Application();
	}
	release(): void {
		this
			.#available++;
		const next =
			this.#queue.shift();
		if (
			next
		) {
			next();
		}
	}
}
