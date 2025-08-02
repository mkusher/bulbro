import * as PIXI from "pixi.js";
import type { Size, Point } from "@/geometry";
import { AnimatedSprite } from "./AnimatedSprite";

export class SwingingAnimation {
	#amplitude: number;
	#frameDuration: number;
	#spriteForFrame: (frame: number) => Promise<PIXI.Container>;
	#dimensions?: Point;
	#cycleLength: number = 20;
	constructor(
		spriteForFrame: (frame: number) => Promise<PIXI.Container>,
		frameDuration: number,
		amplitude: number,
		dimensions?: Point,
	) {
		this.#amplitude = amplitude;
		this.#frameDuration = frameDuration;
		this.#spriteForFrame = spriteForFrame;
		this.#dimensions = dimensions;
	}

	createAnimatedSprite() {
		return new AnimatedSprite<PIXI.Container>(
			this.#cycleLength,
			this.getFrame,
			this.#frameDuration,
			true,
		);
	}

	getFrame = async (frame: number) => {
		const scaleY =
			this.#amplitude * Math.sin((frame * Math.PI) / this.#cycleLength);
		const container = new PIXI.Container();
		const sprite = await this.#spriteForFrame(frame);
		container.addChild(sprite);
		sprite.scale.y = 1 - scaleY;
		sprite.y = scaleY * sprite.height;

		return container;
	};
}
