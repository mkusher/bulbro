import * as PIXI from "pixi.js";
import type { BulbroState } from "../..";
import type { Size } from "../../../geometry";
import {
	getExperienceForLevel,
	getLeverForExperience,
	getTotalExperienceForLevel,
} from "../../Levels";

const blackBorderRectangleHeight = 35;

export class ExperienceSprite {
	#gfx: PIXI.Container;
	#lvlText: PIXI.Text;
	#blackBorderRectangle: PIXI.Graphics;
	#greenExperienceRectangle: PIXI.Graphics;
	constructor(width: number) {
		this.#gfx = new PIXI.Container();
		const style = new PIXI.TextStyle({ fontSize: 14, fill: "#ffffff" });
		this.#lvlText = new PIXI.Text("", style);
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

		blackBorderRectangle.y = 40;

		this.#lvlText.y = 10;

		const greenExperienceRectangle = new PIXI.Graphics();
		blackBorderRectangle.addChild(greenExperienceRectangle);
		blackBorderRectangle.addChild(this.#lvlText);
		this.#blackBorderRectangle = blackBorderRectangle;
		this.#greenExperienceRectangle = greenExperienceRectangle;
		this.#gfx.addChild(this.#blackBorderRectangle);
	}
	appendTo(parent: PIXI.Container, layer?: PIXI.RenderLayer): void {
		parent.addChild(this.#gfx);
		layer?.attach(this.#gfx);
	}
	update(width: number, player?: BulbroState) {
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
		const greenExperienceRectangleWidth = width - 2 * padding;
		greenExperienceRectangle.drawRect(
			padding,
			padding,
			greenExperienceRectangleWidth * experiencePercent,
			blackBorderRectangleHeight - 2 * padding,
		);
		greenExperienceRectangle.endFill();
		this.#lvlText.text = `Lvl ${currentLevelByExp}`;
		this.#lvlText.x =
			greenExperienceRectangleWidth - this.#lvlText.width - padding;
	}
}
