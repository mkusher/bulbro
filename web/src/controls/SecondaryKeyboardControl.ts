import { KeyboardControl } from "./KeyboardControl";
import type { PlayerControl } from "./PlayerControl";

export class SecondaryKeyboardControl implements PlayerControl {
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
	if (code === "KeyW") return "up";
	if (code === "KeyS") return "down";
	if (code === "KeyA") return "left";
	if (code === "KeyD") return "right";
};
