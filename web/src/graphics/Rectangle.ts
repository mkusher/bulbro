import type { Size } from "@/geometry";
import * as PIXI from "pixi.js";

export class Rectangle {
	#gfx: PIXI.Graphics;
	constructor(size: Size, color: number, alpha: number = 1) {
		this.#gfx = new PIXI.Graphics();
		this.update(size, color, alpha);
	}

	get position() {
		return this.#gfx.position;
	}

	update(size: Size, color: number, alpha: number) {
		this.#gfx.clear();
		this.#gfx
			.rect(0, 0, size.width, size.height)
			.fill({ color, alpha })
			.rect(
				size.width * 0.1,
				size.height * 0.1,
				size.width * 0.8,
				size.height * 0.8,
			)
			.cut();
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer?: PIXI.IRenderLayer): void {
		parent.addChild(this.#gfx);
		layer?.attach(this.#gfx);
	}

	remove() {
		this.#gfx.removeFromParent();
	}
}
