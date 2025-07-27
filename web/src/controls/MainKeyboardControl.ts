import { KeyboardControl } from "./KeyboardControl";
import type { PlayerControl } from "./PlayerControl";

export class MainKeyboardControl implements PlayerControl {
	#control: KeyboardControl;
	constructor() {
		this.#control = new KeyboardControl(codeToArrow);
	}
	async start() {
		this.#control.start();
	}
	async stop() {
		this.#control.stop();
	}

	get direction() {
		return this.#control.direction;
	}
	get signal() {
		return this.#control.signal;
	}
}

const codeToArrow = (code: string) => {
	if (code === "ArrowUp") return "up";
	if (code === "ArrowDown") return "down";
	if (code === "ArrowLeft") return "left";
	if (code === "ArrowRight") return "right";
};
