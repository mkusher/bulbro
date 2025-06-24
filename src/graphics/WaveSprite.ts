import * as PIXI from "pixi.js";
import { type RoundState } from "../currentState";

export class WaveSprite {
	#gfx: PIXI.Text;
	constructor() {
		const style = new PIXI.TextStyle({
			fontSize: 16,
			fill: "#ffffff",
			stroke: {
				width: 2,
				color: 0x000000,
				alignment: 1,
			},
		});
		this.#gfx = new PIXI.Text("", style);
		this.#gfx.y = 10;
	}
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void {
		parent.addChild(this.#gfx);
		layer.attach(this.#gfx);
	}
	update(round: RoundState, viewSizeWidth: number) {
		const wave = round.wave;
		this.#gfx.text = `Wave: ${wave}`;
		this.#gfx.x = (viewSizeWidth - this.#gfx.width) / 2;
	}
}
