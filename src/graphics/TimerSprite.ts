import * as PIXI from "pixi.js";

export class TimerSprite {
	#gfx: PIXI.Text;
	constructor() {
		const style = new PIXI.TextStyle({ fontSize: 24, fill: "#ffffff" });
		this.#gfx = new PIXI.Text("", style);
		this.#gfx.y = 10;
	}
	appendTo(parent: PIXI.Container): void {
		parent.addChild(this.#gfx);
	}
	updateText(msLeft: number, viewSizeWidth: number) {
		const totalSec = Math.ceil(msLeft / 1000);
		this.#gfx.text = totalSec.toString();
		this.#gfx.x = (viewSizeWidth - this.#gfx.width) / 2;
	}
}
