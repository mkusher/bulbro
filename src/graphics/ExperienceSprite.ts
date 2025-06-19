import * as PIXI from "pixi.js";
import type { BulbroState } from "../bulbro";
import type { Size } from "../geometry";
import {
	getExperienceForLevel,
	getLeverForExperience,
	getTotalExperienceForLevel,
} from "../bulbro/Levels";

const blackBorderRectangleHeight = 35;

export class ExperienceSprite {
	#gfx: PIXI.Container;
	#text: PIXI.Text;
	#blackBorderRectangle: PIXI.Graphics;
	#greenExperienceRectangle: PIXI.Graphics;
	constructor(playingfieldSize: Size, playerIndex: number) {
		this.#gfx = new PIXI.Container();
		const style = new PIXI.TextStyle({ fontSize: 14, fill: "#ffffff" });
		this.#text = new PIXI.Text("", style);
		const blackBorderRectangle = new PIXI.Graphics();
		blackBorderRectangle.beginFill(0x000000);
		const blackBorderRectangleWidth = playingfieldSize.width * 0.5 * 0.8;
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
				: playingfieldSize.width - blackBorderRectangleWidth - padding;
		blackBorderRectangle.y = 50;

		this.#text.y = 10;

		const greenExperienceRectangle = new PIXI.Graphics();
		blackBorderRectangle.addChild(greenExperienceRectangle);
		blackBorderRectangle.addChild(this.#text);
		this.#blackBorderRectangle = blackBorderRectangle;
		this.#greenExperienceRectangle = greenExperienceRectangle;
		this.#gfx.addChild(this.#blackBorderRectangle);
	}
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void {
		parent.addChild(this.#gfx);
		layer.attach(this.#gfx);
	}
	update(canvasSize: Size, player?: BulbroState) {
		const totalExperience = player?.totalExperience ?? 0;
		const currentLevelByExp = getLeverForExperience(totalExperience);
		const currentLevelExp = getTotalExperienceForLevel(currentLevelByExp);
		const nextLevelExp = getExperienceForLevel(currentLevelByExp + 1);
		const experiencePercent =
			(totalExperience - currentLevelExp) / nextLevelExp;
		const greenExperienceRectangle = this.#greenExperienceRectangle;
		greenExperienceRectangle.clear();
		greenExperienceRectangle.beginFill(0x22cc22);
		const padding = 5;
		const greenExperienceRectangleWidth =
			canvasSize.width * 0.5 * 0.8 - 2 * padding;
		greenExperienceRectangle.drawRect(
			padding,
			padding,
			greenExperienceRectangleWidth * experiencePercent,
			blackBorderRectangleHeight - 2 * padding,
		);
		greenExperienceRectangle.endFill();
		this.#text.text = `Lvl ${currentLevelByExp}`;
		this.#text.x = greenExperienceRectangleWidth - this.#text.width - padding;
	}
}
