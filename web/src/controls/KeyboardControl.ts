import { signal, type Signal } from "@preact/signals";
import { normalize, zeroPoint, type Direction } from "../geometry";
import type { PlayerControl } from "./PlayerControl";

export type ArrowKeys = {
	up?: boolean;
	left?: boolean;
	right?: boolean;
	down?: boolean;
};
function keysToDirection(keys: ArrowKeys) {
	return normalize({
		x: Number(!!keys.right) - Number(!!keys.left),
		y: Number(!!keys.down) - Number(!!keys.up),
	});
}

export type CodeToArrow = (code: string) => keyof ArrowKeys | undefined;

export class KeyboardControl implements PlayerControl {
	#keys: ArrowKeys = {};
	#codeToArrow: CodeToArrow;
	#signal: Signal<Direction>;
	constructor(codeToArrow: CodeToArrow) {
		this.#codeToArrow = codeToArrow;
		this.#signal = signal(zeroPoint());
	}
	async start() {
		window.addEventListener("keydown", this.#onKeyDown);
		window.addEventListener("keyup", this.#onKeyUp);
	}
	async stop() {
		window.removeEventListener("keydown", this.#onKeyDown);
		window.removeEventListener("keyup", this.#onKeyUp);
    this.#signal.value = zeroPoint()
    this.#keys = {}
	}

	get direction() {
		return this.#signal.value;
	}

	get signal() {
		return this.#signal;
	}

	#onKeyUp = (e: KeyboardEvent) => {
		const arrow = this.#codeToArrow(e.code);
		if (!arrow) return;
		this.#keys[arrow] = false;
		this.#signal.value = keysToDirection(this.#keys);
	};

	#onKeyDown = (e: KeyboardEvent) => {
		const arrow = this.#codeToArrow(e.code);
		if (!arrow) return;
		this.#keys[arrow] = true;
		this.#signal.value = keysToDirection(this.#keys);
	};
}
