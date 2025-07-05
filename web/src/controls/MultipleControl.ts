import { isEqual } from "../geometry";
import type { PlayerControl } from "./PlayerControl";

const z = { x: 0, y: 0 };
export class MultipleControl implements PlayerControl {
	#controls: PlayerControl[];
	constructor(controls: PlayerControl[]) {
		this.#controls = controls;
	}

	async start() {
		await Promise.all(this.#controls.map((c) => c.start()));
	}
	async stop() {
		await Promise.all(this.#controls.map((c) => c.stop()));
	}

	getDirection() {
		for (const c of this.#controls) {
			if (!isEqual(c.getDirection(), z)) {
				return c.getDirection();
			}
		}
		return z;
	}
}
