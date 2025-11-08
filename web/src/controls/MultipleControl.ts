import {
	computed,
	type Signal,
} from "@preact/signals";
import {
	type Direction,
	isEqual,
	zeroPoint,
} from "../geometry";
import type { PlayerControl } from "./PlayerControl";

const z =
	zeroPoint();
export class MultipleControl
	implements
		PlayerControl
{
	#controls: PlayerControl[];
	#signal: Signal<Direction>;
	constructor(
		controls: PlayerControl[],
	) {
		this.#controls =
			controls;
		this.#signal =
			computed(
				() => {
					for (const c of this
						.#controls) {
						if (
							!isEqual(
								c.direction,
								z,
							)
						) {
							return c.direction;
						}
					}
					return z;
				},
			);
	}

	async start() {
		await Promise.all(
			this.#controls.map(
				(
					c,
				) =>
					c.start(),
			),
		);
	}
	async stop() {
		await Promise.all(
			this.#controls.map(
				(
					c,
				) =>
					c.stop(),
			),
		);
	}

	get direction() {
		return this
			.#signal
			.value;
	}

	get signal() {
		return this
			.#signal;
	}
}
