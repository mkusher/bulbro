import * as PIXI from "pixi.js";

export class PixiAppSemaphore {
	#available: number;
	#lock: PromiseWithResolvers<void> | null =
		null;
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
			await this.waitForAvailability();
		}
		this
			.#available--;
		return new PIXI.Application();
	}
	waitForAvailability() {
		if (
			!this
				.#lock
		) {
			this.#lock =
				Promise.withResolvers();
		}
		return this
			.#lock
			.promise;
	}
	release(): void {
		this
			.#available++;
		if (
			this
				.#lock &&
			this
				.#available >
				0
		) {
			this.#lock.resolve();
			this.#lock =
				null;
		}
	}
}
