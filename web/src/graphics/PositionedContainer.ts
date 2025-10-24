import type { Direction, Position } from "@/geometry";
import * as PIXI from "pixi.js";

export class PositionedContainer {
	#container: PIXI.Container;
	constructor(container = new PIXI.Container()) {
		this.#container = container;
	}

	get container() {
		return this.#container;
	}

	update(position: Position, lastDirection?: Direction) {
		this.#container.x = position.x;
		this.#container.y = position.y;
		if (!lastDirection) {
			return;
		}
		if (lastDirection.x < 0) {
			this.#container.scale.x = -1 * Math.abs(this.#container.scale.x);
		} else if (lastDirection.x > 0) {
			this.#container.scale.x = Math.abs(this.#container.scale.x);
		}
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer: PIXI.RenderLayer): void {
		parent.addChild(this.#container);
		layer.attach(this.#container);
	}

	addChild(child: PIXI.ContainerChild) {
		this.#container.addChild(child);
	}

	remove() {
		this.#container.removeFromParent();
	}
}
