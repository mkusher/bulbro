import * as PIXI from "pixi.js";
import type { BulbroState } from "../BulbroState";
import type { Size } from "../../geometry";
import {
	getExperienceForLevel,
	getLeverForExperience,
	getTotalExperienceForLevel,
} from "../Levels";

const blackBorderRectangleHeight = 35;

export class ExperienceSprite {
	#gfx: PIXI.Container;
	#lvlText: PIXI.Text;
	#materialsText: PIXI.Text;
	#blackBorderRectangle: PIXI.Graphics;
	#greenExperienceRectangle: PIXI.Graphics;
	constructor(playingfieldSize: Size, playerIndex: number) {
		this.#gfx = new PIXI.Container();
		const style = new PIXI.TextStyle({ fontSize: 14, fill: "#ffffff" });
		this.#lvlText = new PIXI.Text("", style);
		this.#materialsText = new PIXI.Text(
			"",
			new PIXI.TextStyle({
				fontSize: 16,
				fill: "#22ff22",
				stroke: {
					width: 2,
					color: 0x000000,
					alignment: 1,
				},
			}),
		);
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

		const leftBorder =
			playerIndex === 0
				? padding
				: playingfieldSize.width - blackBorderRectangleWidth - padding;

		blackBorderRectangle.x = leftBorder;
		blackBorderRectangle.y = 50;

		this.#lvlText.y = 10;
		this.#materialsText.y =
			blackBorderRectangle.y + blackBorderRectangle.height + padding;
		this.#materialsText.x = leftBorder + padding;

		const greenExperienceRectangle = new PIXI.Graphics();
		blackBorderRectangle.addChild(greenExperienceRectangle);
		blackBorderRectangle.addChild(this.#lvlText);
		this.#blackBorderRectangle = blackBorderRectangle;
		this.#greenExperienceRectangle = greenExperienceRectangle;
		this.#gfx.addChild(this.#blackBorderRectangle);
		this.#gfx.addChild(this.#materialsText);
	}
	appendTo(parent: PIXI.Container, layer?: PIXI.RenderLayer): void {
		parent.addChild(this.#gfx);
		layer?.attach(this.#gfx);
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
		const materials = player?.materialsAvailable.toString() ?? "0";
		this.#lvlText.text = `Lvl ${currentLevelByExp}`;
		this.#lvlText.x =
			greenExperienceRectangleWidth - this.#lvlText.width - padding;
		this.#materialsText.text = materials;
	}
}
