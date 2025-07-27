import * as PIXI from "pixi.js";
import type { Direction, Position } from "../../geometry";
import type { BulbroState } from "../BulbroState";
import { AnimatedSprite } from "../../graphics/AnimatedSprite";
import { CharacterSprites } from "../../graphics/CharacterSprite";

const chibiSize = {
	width: 420,
	height: 600,
};

const toThreeDigits = (i: number) =>
	i >= 100 ? i : i >= 10 ? `0${i}` : `00${i}`;

const loadAssets = (total: number, f: (i: number) => string) =>
	Promise.all(
		new Array(total)
			.fill("")
			.map((_, i) => f(i))
			.map((path) => PIXI.Assets.load(path)),
	);

type FilePaths = {
	idle: string;
	walking: string;
	hurt: string;
};

/**
 * Manages a player sprite graphic.
 */
export class ChibiSprite {
	#gfx: PIXI.Container;
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#movement?: AnimatedSprite;
	#idle?: AnimatedSprite;
	#hurt?: AnimatedSprite;
	#characterSprites?: CharacterSprites;
	#basePath: string;
	#filePaths: FilePaths;

	constructor(basePath: string, filePaths: FilePaths, debug: boolean) {
		this.#basePath = basePath;
		this.#filePaths = filePaths;
		this.#gfx = new PIXI.Container();
		this.#debugPosition = new PIXI.Graphics();
		this.#sprite = new PIXI.Sprite();
		this.#sprite.scale.set(0.075);
		this.#gfx.addChild(this.#sprite);
		if (debug) {
			this.#debugPosition.beginFill(0x0000ff, 0.4);
			this.#debugPosition.drawRect(-10, -10, 10, 10);
			this.#debugPosition.endFill();
			this.#gfx.addChild(this.#debugPosition);
		}
		this.init();
	}

	async init() {
		const topPadding = 190;
		const leftPadding = 215;
		const [idlePositions, runningPositions, hurtPositions] = await Promise.all([
			loadAssets(
				18,
				(i) =>
					this.#basePath + `${this.#filePaths.idle}${toThreeDigits(i)}.png`,
			),
			loadAssets(
				12,
				(i) =>
					this.#basePath + `${this.#filePaths.walking}${toThreeDigits(i)}.png`,
			),
			loadAssets(
				12,
				(i) =>
					this.#basePath + `${this.#filePaths.hurt}${toThreeDigits(i)}.png`,
			),
		]);

		this.#movement = new AnimatedSprite(
			runningPositions.length,
			(frame) =>
				new PIXI.Texture({
					source: runningPositions[frame],
					frame: new PIXI.Rectangle(
						leftPadding,
						topPadding,
						chibiSize.width,
						chibiSize.height,
					),
				}),
			50,
		);

		this.#idle = new AnimatedSprite(
			idlePositions.length,
			(frame) =>
				new PIXI.Texture({
					source: idlePositions[frame],
					frame: new PIXI.Rectangle(
						leftPadding,
						topPadding,
						chibiSize.width,
						chibiSize.height,
					),
				}),
		);

		this.#hurt = new AnimatedSprite(
			hurtPositions.length,
			(frame) =>
				new PIXI.Texture({
					source: hurtPositions[frame],
					frame: new PIXI.Rectangle(
						leftPadding,
						topPadding,
						chibiSize.width,
						chibiSize.height,
					),
				}),
			75,
			false,
		);

		this.#characterSprites = new CharacterSprites({
			hurt: this.#hurt,
			walking: this.#movement,
			idle: this.#idle,
		});

		this.#sprite.texture = await this.#idle.getSprite(0);
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void {
		parent.addChild(this.#gfx);
		layer.attach(this.#gfx);
	}

	update(player: BulbroState, delta: number) {
		this.#updatePosition(player.position, player.lastDirection);

		this.#characterSprites?.getSprite(player, delta).then((texture) => {
			this.#sprite.texture = texture;
		});
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#gfx.parent?.removeChild(this.#gfx);
	}

	/**
	 * Updates sprite position.
	 */
	#updatePosition(pos: Position, lastDirection?: Direction): void {
		this.#gfx.x = pos.x;
		this.#gfx.y = pos.y;

		if (lastDirection && lastDirection.x < 0) {
			this.#sprite.scale.x = -1 * Math.abs(this.#sprite.scale.x);
			this.#sprite.x = 8;
			this.#sprite.y = -40;
		} else if (lastDirection && lastDirection.x > 0) {
			this.#sprite.x = -20;
			this.#sprite.y = -40;
			this.#sprite.scale.x = Math.abs(this.#sprite.scale.y);
		}
	}
}
