import { nowTime } from "./time";

export class DurationTracker {
	#startedAt!: number;

	constructor() {
		this.start();
	}

	start() {
		this.#startedAt = performance.now();
	}

	length() {
		return nowTime(performance.now() - this.#startedAt);
	}
}
