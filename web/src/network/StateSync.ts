import { apiUrl } from "./clientConfig";

export const defaultInterval = 5;
export const persistDelay = 50;
export class StateSync {
	#timer: Timer | undefined = undefined;
	#interval: number;
	#url: string;
	#isStarted = false;
	#getState: () => object;
	#lastUpdated: number;

	constructor(
		url: string,
		getState: () => object,
		interval: number = defaultInterval,
	) {
		this.#interval = interval;
		this.#url = url;
		this.#getState = getState;
		this.#lastUpdated = Date.now();
	}

	start() {
		if (this.#isStarted) {
			return;
		}
		this.#isStarted = true;
		this.#setupTimer();
	}

	#setupTimer() {
		this.#timer = setTimeout(
			() => {
				this.#runTick().then(() => {
					if (this.#isStarted) {
						this.#setupTimer();
					}
				});
			},
			Math.max(persistDelay - Date.now() + this.#lastUpdated, this.#interval),
		);
	}

	async #runTick() {
		const url = new URL(this.#url, apiUrl);
		const res = await fetch(url, {
			method: "PUT",
			body: JSON.stringify({
				state: this.#getState(),
			}),
		});
		this.#lastUpdated = Date.now();

		return res.ok;
	}

	stop() {
		clearTimeout(this.#timer);
		this.#isStarted = false;
		this.#timer = undefined;
	}
}
