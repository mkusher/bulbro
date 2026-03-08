import * as PIXI from "pixi.js";
import type { Position } from "@/geometry";
import type { BulbroState } from "../BulbroState";

const barHeight = 8;
const padding = 1;

export class OverheadHealthBar {
	#container: PIXI.Graphics;
	#fill: PIXI.Graphics;
	#barWidth: number;
	#offsetY: number;

	constructor(
		characterWidth: number,
		characterHeight: number,
	) {
		this.#barWidth =
			characterWidth *
			1.15;
		this.#offsetY =
			-characterHeight -
			barHeight -
			8;
		this.#container =
			new PIXI.Graphics();
		this.#fill =
			new PIXI.Graphics();

		this.#container.beginFill(
			0x000000,
		);
		this.#container.drawRect(
			0,
			0,
			this
				.#barWidth,
			barHeight,
		);
		this.#container.endFill();

		this.#container.addChild(
			this
				.#fill,
		);

		this.#container.visible = false;
	}

	appendTo(
		parent: PIXI.Container,
		layer?: PIXI.RenderLayer,
	): void {
		parent.addChild(
			this
				.#container,
		);
		layer?.attach(
			this
				.#container,
		);
	}

	remove(): void {
		this.#container.removeFromParent();
	}

	update(
		player: BulbroState,
	) {
		const maxHp =
			player
				.stats
				.maxHp;
		const hp =
			player.healthPoints;
		const healthPercent =
			maxHp >
			0
				? Math.min(
						hp /
							maxHp,
						1,
					)
				: 0;

		this.#container.x =
			player
				.position
				.x -
			this
				.#barWidth /
				2;
		this.#container.y =
			player
				.position
				.y +
			this
				.#offsetY;

		if (
			healthPercent >=
			1
		) {
			this.#container.visible = false;
			return;
		}

		this.#container.visible = true;
		this.#fill.clear();
		this.#fill.beginFill(
			0xcc2222,
		);
		this.#fill.drawRect(
			padding,
			padding,
			(this
				.#barWidth -
				2 *
					padding) *
				healthPercent,
			barHeight -
				2 *
					padding,
		);
		this.#fill.endFill();
	}
}
