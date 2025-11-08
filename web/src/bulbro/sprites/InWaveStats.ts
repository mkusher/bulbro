import * as PIXI from "pixi.js";
import type { Size } from "../../geometry";
import type { BulbroState } from "../BulbroState";
import { ExperienceSprite } from "./InWaveStats/ExperienceSprite";
import { HealthSprite } from "./InWaveStats/HealthSprite";
import { MaterialsIndicator } from "./InWaveStats/MaterialsIndicator";

export class InWaveStats {
	#gfx: PIXI.Container;
	#playerIndex: number;
	#healthIndicator: HealthSprite;
	#experienceIndicator: ExperienceSprite;
	#materialsIndicator: MaterialsIndicator;
	#padding = 20;

	constructor(
		canvasSize: Size,
		playerIndex: number,
	) {
		this.#playerIndex =
			playerIndex;
		this.#gfx =
			new PIXI.Container();

		const width =
			this.#width(
				canvasSize,
			);

		const leftBorder =
			this
				.#playerIndex ===
			0
				? this
						.#padding
				: canvasSize.width -
					width -
					this
						.#padding;

		this.#gfx.x =
			leftBorder;
		this.#gfx.y =
			this.#padding;

		this.#healthIndicator =
			new HealthSprite(
				width,
			);
		this.#experienceIndicator =
			new ExperienceSprite(
				width,
			);
		this.#materialsIndicator =
			new MaterialsIndicator(
				width,
				playerIndex,
			);
		this.#healthIndicator.appendTo(
			this
				.#gfx,
		);
		this.#experienceIndicator.appendTo(
			this
				.#gfx,
		);
		this.#materialsIndicator.appendTo(
			this
				.#gfx,
		);
	}
	appendTo(
		parent: PIXI.Container,
		layer: PIXI.RenderLayer,
	): void {
		parent.addChild(
			this
				.#gfx,
		);
		layer.attach(
			this
				.#gfx,
		);
	}
	update(
		canvasSize: Size,
		player?: BulbroState,
	) {
		const width =
			this.#width(
				canvasSize,
			);
		this.#healthIndicator.update(
			width,
			player,
		);
		this.#experienceIndicator.update(
			width,
			player,
		);
		this.#materialsIndicator.update(
			width,
			player,
		);
	}
	#width(
		canvasSize: Size,
	) {
		return Math.max(
			canvasSize.width *
				0.35 -
				2 *
					this
						.#padding,
			120,
		);
	}
}
