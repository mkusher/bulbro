import { direction, distance, type Direction, type Point } from "../geometry";
import type { PlayerControl } from "./PlayerControl";

const zeroPoint = () => ({ x: 0, y: 0 });

export class TouchscreenControl implements PlayerControl {
	#startPoint: Point = zeroPoint();
	#direction: Direction = zeroPoint();

	async start() {
		this.#startPoint = zeroPoint();
		window.addEventListener("touchstart", this.#handleStart);
		window.addEventListener("touchend", this.#handleEnd);
		window.addEventListener("touchcancel", this.#handleCancel);
		window.addEventListener("touchmove", this.#handleMove);
	}
	async stop() {
		window.removeEventListener("touchstart", this.#handleStart);
		window.removeEventListener("touchend", this.#handleEnd);
		window.removeEventListener("touchcancel", this.#handleCancel);
		window.removeEventListener("touchmove", this.#handleMove);
	}

	getDirection() {
		return this.#direction;
	}

	#handleStart = (e: TouchEvent) => {
		const touch = e.touches[0];
		if (!touch) return;
		this.#startPoint.x = touch.clientX;
		this.#startPoint.y = touch.clientY;
	};
	#handleEnd = () => {
		this.#direction = zeroPoint();
	};
	#handleCancel = () => {
		this.#direction = zeroPoint();
	};
	#minimalDistance = 16;
	#handleMove = (e: TouchEvent) => {
		const touch = e.touches[0];
		if (!touch) return;
		const move = { x: touch.clientX, y: touch.clientY };
		if (distance(this.#startPoint, move) < this.#minimalDistance) {
			return;
		}

		this.#direction = direction(this.#startPoint, move);
	};
}
