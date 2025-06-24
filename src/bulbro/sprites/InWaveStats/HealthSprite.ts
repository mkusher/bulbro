import * as PIXI from "pixi.js";
import type { BulbroState } from "../../BulbroState";

const blackBorderRectangleHeight = 35;

export class HealthSprite {
	#gfx: PIXI.Container;
	#text: PIXI.Text;
	#blackBorderRectangle: PIXI.Graphics;
	#redHealthRectangle: PIXI.Graphics;
	constructor(width: number) {
		this.#gfx = new PIXI.Container();
		const style = new PIXI.TextStyle({ fontSize: 14, fill: "#ffffff" });
		this.#text = new PIXI.Text("", style);
		const blackBorderRectangle = new PIXI.Graphics();
		blackBorderRectangle.beginFill(0x000000);
		const blackBorderRectangleWidth = width;
		blackBorderRectangle.drawRect(
			0,
			0,
			blackBorderRectangleWidth,
			blackBorderRectangleHeight,
		);
		blackBorderRectangle.endFill();

		this.#text.y = 10;

		const redHealthRectangle = new PIXI.Graphics();
		blackBorderRectangle.addChild(redHealthRectangle);
		blackBorderRectangle.addChild(this.#text);
		this.#blackBorderRectangle = blackBorderRectangle;
		this.#redHealthRectangle = redHealthRectangle;
		this.#gfx.addChild(this.#blackBorderRectangle);
	}
	appendTo(parent: PIXI.Container, layer?: PIXI.IRenderLayer): void {
		parent.addChild(this.#gfx);
		layer?.attach(this.#gfx);
	}
	update(width: number, player?: BulbroState) {
		const healthPercent = player?.stats.maxHp
			? Math.min((player?.healthPoints ?? 0) / player.stats.maxHp, 1)
			: 0;
		const redHealthRectangle = this.#redHealthRectangle;
		redHealthRectangle.clear();
		redHealthRectangle.beginFill(0xcc2222);
		const padding = 5;
		const redHealthRectangleWidth = width - 2 * padding;
		redHealthRectangle.drawRect(
			padding,
			padding,
			redHealthRectangleWidth * healthPercent,
			blackBorderRectangleHeight - 2 * padding,
		);
		redHealthRectangle.endFill();
		this.#text.text = `${Math.floor(player?.healthPoints ?? 0)} / ${player?.stats.maxHp ?? 0}`;
		this.#text.x = padding + redHealthRectangleWidth / 2 - this.#text.width / 2;
	}
}
