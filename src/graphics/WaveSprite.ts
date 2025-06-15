import * as PIXI from "pixi.js";
import { type RoundState } from "../currentState";

export class WaveSprite {
	#gfx: PIXI.Text;
	constructor() {
		const style = new PIXI.TextStyle({ fontSize: 16, fill: "#ffffff" });
		this.#gfx = new PIXI.Text("", style);
		this.#gfx.y = 10;
	}
	appendTo(parent: PIXI.Container): void {
		parent.addChild(this.#gfx);
	}
	update(round: RoundState, viewSizeWidth: number) {
		const wave = round.wave;
		this.#gfx.text = `Wave: ${wave}`;
		this.#gfx.x = (viewSizeWidth - this.#gfx.width) / 2;
	}
}
