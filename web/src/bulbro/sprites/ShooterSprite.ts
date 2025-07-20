import * as PIXI from "pixi.js";
import type { Direction, Position } from "../../geometry";
import type { BulbroState } from "../BulbroState";
import { AnimatedSprite } from "../../graphics/AnimatedSprite";
import { CharacterSprites } from "../../graphics/CharacterSprite";

const path =
	"/game-assets/craftpix-net-671351-free-pixel-prototype-character-sprites-for-shooter/Animations/";

const shooterSize = {
	width: 40,
	height: 75,
};

/**
 * Manages a player sprite graphic.
 */
export class ShooterSprite {
	#gfx: PIXI.Container;
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#movement?: AnimatedSprite;
	#idle?: AnimatedSprite;
	#hurt?: AnimatedSprite;
	#characterSprites?: CharacterSprites;

	constructor(debug?: boolean) {
		this.#gfx = new PIXI.Container();
		this.#debugPosition = new PIXI.Graphics();
		this.#sprite = new PIXI.Sprite();
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
		const topPadding = 60;
		const walkPositions = [
			37, 167, 297, 427, 552, 676, 803, 937, 1066, 1194, 1318, 1439,
		];
		const idlePositions = [50, 178, 306, 434, 562, 690];
		const hurtPositions = [42, 168, 295, 420];
		const [idle, walk, hurt] = await Promise.all([
			PIXI.Assets.load(path + "Idle.png"),
			PIXI.Assets.load(path + "Walk.png"),
			PIXI.Assets.load(path + "Hurt.png"),
		]);

		this.#movement = new AnimatedSprite(
			walkPositions.length,
			(frame) =>
				new PIXI.Texture({
					source: walk,
					frame: new PIXI.Rectangle(
						walkPositions[frame],
						topPadding,
						shooterSize.width,
						shooterSize.height,
					),
				}),
		);

		this.#idle = new AnimatedSprite(
			idlePositions.length,
			(frame) =>
				new PIXI.Texture({
					source: idle,
					frame: new PIXI.Rectangle(
						idlePositions[frame],
						topPadding,
						shooterSize.width,
						shooterSize.height,
					),
				}),
		);

		this.#hurt = new AnimatedSprite(
			hurtPositions.length,
			(frame) =>
				new PIXI.Texture({
					source: hurt,
					frame: new PIXI.Rectangle(
						hurtPositions[frame],
						topPadding,
						shooterSize.width,
						shooterSize.height,
					),
				}),
			75,
			false,
		);

		this.#characterSprites = new CharacterSprites({
			walking: this.#movement,
			idle: this.#idle,
			hurt: this.#hurt,
		});

		this.#sprite.texture = await this.#idle.getSprite(0);
		this.#sprite.scale.set(0.5);
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
		} else {
			this.#sprite.x = -20;
			this.#sprite.y = -40;
			this.#sprite.scale.x = Math.abs(this.#sprite.scale.y);
		}
	}
}
