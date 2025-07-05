import * as PIXI from "pixi.js";
import type { BulbroState } from "../..";
import type { Size } from "../../../geometry";
import {
	getExperienceForLevel,
	getLeverForExperience,
	getTotalExperienceForLevel,
} from "../../Levels";

const blackBorderRectangleHeight = 35;

export class MaterialsIndicator {
	#gfx: PIXI.Container;
	#materialsText: PIXI.Text;
	constructor(width: number, playerIndex: number) {
		this.#gfx = new PIXI.Container();
		this.#materialsText = new PIXI.Text(
			"",
			new PIXI.TextStyle({
				fontSize: 20,
				fill: "#22ff22",
				stroke: {
					width: 4,
					color: 0x000000,
					alignment: 1,
				},
			}),
		);
		const padding = 10;
		this.#materialsText.y = 40 + blackBorderRectangleHeight + padding;
		this.#materialsText.x = padding;

		this.#gfx.addChild(this.#materialsText);
	}
	appendTo(parent: PIXI.Container, layer?: PIXI.IRenderLayer): void {
		parent.addChild(this.#gfx);
		layer?.attach(this.#gfx);
	}
	update(width: number, player?: BulbroState) {
		const materials = player?.materialsAvailable.toString() ?? "0";
		this.#materialsText.text = materials;
	}
}
