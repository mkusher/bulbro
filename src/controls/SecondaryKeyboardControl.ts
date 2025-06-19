import type { PlayerControl } from "./PlayerControl";

export type ArrowKeys = {
	up?: boolean;
	left?: boolean;
	right?: boolean;
	down?: boolean;
};
function keysToDirection(keys: ArrowKeys) {
	return {
		x: Number(!!keys.right) - Number(!!keys.left),
		y: Number(!!keys.down) - Number(!!keys.up),
	};
}

export class SecondaryKeyboardControl implements PlayerControl {
	#keys: ArrowKeys = {};
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
		const arrow = codeToArrow(e.code);
		if (!arrow) return;
		this.#keys[arrow] = false;
	};

	#onKeyDown = (e: KeyboardEvent) => {
		const arrow = codeToArrow(e.code);
		if (!arrow) return;
		this.#keys[arrow] = true;
	};
}

const codeToArrow = (code: string) => {
	if (code === "KeyW") return "up";
	if (code === "KeyS") return "down";
	if (code === "KeyA") return "left";
	if (code === "KeyD") return "right";
};
