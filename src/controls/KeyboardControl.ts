import { normalize } from "../geometry";
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
	constructor(codeToArrow: CodeToArrow) {
		this.#codeToArrow = codeToArrow;
	}
	async start() {
		window.addEventListener("keydown", this.#onKeyDown);
		window.addEventListener("keyup", this.#onKeyUp);
	}
	async stop() {
		window.removeEventListener("keydown", this.#onKeyDown);
		window.removeEventListener("keyup", this.#onKeyUp);
	}

	getDirection() {
		return keysToDirection(this.#keys);
	}

	#onKeyUp = (e: KeyboardEvent) => {
		const arrow = this.#codeToArrow(e.code);
		if (!arrow) return;
		this.#keys[arrow] = false;
	};

	#onKeyDown = (e: KeyboardEvent) => {
		const arrow = this.#codeToArrow(e.code);
		if (!arrow) return;
		this.#keys[arrow] = true;
	};
}
