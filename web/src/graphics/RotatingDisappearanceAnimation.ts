import * as PIXI from "pixi.js";
import { AnimatedSprite } from "./AnimatedSprite";

export class RotatingDisapperanceAnimation {
	#frameDuration: number;
	#spriteForFrame: (
		frame: number,
	) => Promise<PIXI.Container>;
	#cycleLength: number = 20;
	#rotationsPerAnimation: number;
	constructor(
		spriteForFrame: (
			frame: number,
		) => Promise<PIXI.Container>,
		frameDuration: number,
		rotationsPerAnimation: number,
	) {
		this.#frameDuration =
			frameDuration;
		this.#spriteForFrame =
			spriteForFrame;
		this.#rotationsPerAnimation =
			rotationsPerAnimation;
	}

	createAnimatedSprite() {
		return new AnimatedSprite<PIXI.Container>(
			this
				.#cycleLength,
			this
				.getFrame,
			this
				.#frameDuration,
			false,
		);
	}

	getFrame =
		async (
			frame: number,
		) => {
			const container =
				new PIXI.Container();
			const sprite =
				await this.#spriteForFrame(
					frame,
				);
			container.addChild(
				sprite,
			);

			const progress =
				frame /
				this
					.#cycleLength;
			sprite.rotation =
				progress *
				this
					.#rotationsPerAnimation *
				2 *
				Math.PI;
			sprite.scale =
				1 -
				progress;

			return container;
		};
}
