import * as PIXI from "pixi.js";
import type { Point } from "@/geometry";
import { AnimatedSprite } from "./AnimatedSprite";

export class SwingingAnimation {
	#amplitude: number;
	#frameDuration: number;
	#spriteForFrame: (
		frame: number,
	) => Promise<PIXI.Container>;
	#dimensions: Point;
	#cycleLength: number = 20;
	constructor(
		spriteForFrame: (
			frame: number,
		) => Promise<PIXI.Container>,
		frameDuration: number,
		amplitude: number,
		dimensions: Point = {
			x: 0,
			y: 1,
		},
	) {
		this.#amplitude =
			amplitude;
		this.#frameDuration =
			frameDuration;
		this.#spriteForFrame =
			spriteForFrame;
		this.#dimensions =
			dimensions;
	}

	createAnimatedSprite() {
		return new AnimatedSprite<PIXI.Container>(
			this
				.#cycleLength,
			this
				.getFrame,
			this
				.#frameDuration,
			true,
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
			if (
				this
					.#dimensions
					.y
			) {
				const scale =
					this
						.#amplitude *
					Math.sin(
						(frame *
							Math.PI) /
							this
								.#cycleLength,
					) *
					this
						.#dimensions
						.y;
				sprite.scale.y =
					1 -
					scale;
			}
			if (
				this
					.#dimensions
					.x
			) {
				const scale =
					this
						.#amplitude *
					Math.sin(
						(frame *
							Math.PI) /
							this
								.#cycleLength,
					) *
					this
						.#dimensions
						.x;
				sprite.scale.x =
					1 -
					scale;
			}

			return container;
		};
}
