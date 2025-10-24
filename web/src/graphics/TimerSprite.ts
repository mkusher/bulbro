import * as PIXI from "pixi.js";
import { getTimeLeft, type RoundState } from "../waveState";

export class TimerSprite {
	#gfx: PIXI.Text;
	constructor() {
		const style = new PIXI.TextStyle({
			fontSize: 28,
			fill: "#ffffff",
			stroke: {
				width: 2,
				color: 0x000000,
				alignment: 1,
			},
		});
		this.#gfx = new PIXI.Text("", style);
		this.#gfx.y = 30;
	}
	appendTo(parent: PIXI.Container, layer: PIXI.RenderLayer): void {
		parent.addChild(this.#gfx);
		layer.attach(this.#gfx);
	}
	update(round: RoundState, viewSizeWidth: number) {
		const timeLeft = getTimeLeft(round);
		const totalSec = Math.max(Math.ceil(timeLeft / 1000), 0);
		this.#gfx.text = totalSec.toString();
		this.#gfx.x = (viewSizeWidth - this.#gfx.width) / 2;
	}
}
