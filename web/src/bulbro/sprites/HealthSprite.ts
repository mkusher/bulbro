import * as PIXI from "pixi.js";
import type { BulbroState } from "../BulbroState";
import type { Size } from "../../geometry";

const blackBorderRectangleHeight = 35;

export class HealthSprite {
	#gfx: PIXI.Container;
	#text: PIXI.Text;
	#blackBorderRectangle: PIXI.Graphics;
	#redHealthRectangle: PIXI.Graphics;
	#playerIndex: number;
	constructor(canvasSize: Size, playerIndex: number) {
		this.#playerIndex = playerIndex;
		this.#gfx = new PIXI.Container();
		const style = new PIXI.TextStyle({ fontSize: 14, fill: "#ffffff" });
		this.#text = new PIXI.Text("", style);
		const blackBorderRectangle = new PIXI.Graphics();
		blackBorderRectangle.beginFill(0x000000);
		const blackBorderRectangleWidth = canvasSize.width * 0.5 * 0.8;
		blackBorderRectangle.drawRect(
			0,
			0,
			blackBorderRectangleWidth,
			blackBorderRectangleHeight,
		);
		blackBorderRectangle.endFill();

		const padding = 10;

		blackBorderRectangle.x =
			playerIndex === 0
				? padding
				: canvasSize.width - blackBorderRectangleWidth - padding;
		blackBorderRectangle.y = 10;

		this.#text.y = 10;

		const redHealthRectangle = new PIXI.Graphics();
		blackBorderRectangle.addChild(redHealthRectangle);
		blackBorderRectangle.addChild(this.#text);
		this.#blackBorderRectangle = blackBorderRectangle;
		this.#redHealthRectangle = redHealthRectangle;
		this.#gfx.addChild(this.#blackBorderRectangle);
	}
	appendTo(parent: PIXI.Container, layer?: PIXI.RenderLayer): void {
		parent.addChild(this.#gfx);
		layer?.attach(this.#gfx);
	}
	update(canvasSize: Size, player?: BulbroState) {
		const healthPercent = player?.stats.maxHp
			? Math.min((player?.healthPoints ?? 0) / player.stats.maxHp, 1)
			: 0;
		const redHealthRectangle = this.#redHealthRectangle;
		redHealthRectangle.clear();
		redHealthRectangle.beginFill(0xcc2222);
		const padding = 5;
		const redHealthRectangleWidth = canvasSize.width * 0.5 * 0.8 - 2 * padding;
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
