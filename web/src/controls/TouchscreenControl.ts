import { signal, type Signal } from "@preact/signals";
import {
	direction,
	distance,
	normalize,
	type Direction,
	type Point,
} from "../geometry";
import type { PlayerControl } from "./PlayerControl";

const zeroPoint = () => ({ x: 0, y: 0 });

export class TouchscreenControl implements PlayerControl {
	#startPoint: Signal<Point> = signal(zeroPoint());
	#direction: Signal<Direction> = signal(zeroPoint());
	#joystickSize: number;
	#minimalDistance: number;

	constructor(joystickSize: number, minimalDistance: number = 8) {
		this.#joystickSize = joystickSize;
		this.#minimalDistance = minimalDistance;
	}

	async start() {
		this.#startPoint.value = zeroPoint();
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
		return this.#direction.value;
	}

	get direction() {
		return this.#direction.value;
	}

	get signal() {
		return this.#direction;
	}

	get startPoint() {
		return this.#startPoint.value;
	}

	#handleStart = (e: TouchEvent) => {
		const touch = e.touches[0];
		if (!touch) return;
		this.#startPoint.value = {
			x: touch.clientX,
			y: touch.clientY,
		};
	};
	#handleEnd = () => {
		this.#direction.value = zeroPoint();
		this.#startPoint.value = zeroPoint();
	};
	#handleCancel = () => {
		this.#direction.value = zeroPoint();
		this.#startPoint.value = zeroPoint();
	};
	#handleMove = (e: TouchEvent) => {
		const touch = e.touches[0];
		if (!touch) return;
		const move = { x: touch.clientX, y: touch.clientY };
		const d = distance(this.#startPoint.value, move);
		if (d < this.#minimalDistance) {
			return;
		}

		const direct = normalize(direction(this.#startPoint.value, move));

		this.#direction.value = {
			x: direct.x * Math.min(d / this.#joystickSize, 1),
			y: direct.y * Math.min(d / this.#joystickSize, 1),
		};
	};
}
