import * as PIXI from "pixi.js";
import type { Direction, Position } from "../../geometry";
import type { BulbroState } from "../BulbroState";
import { AnimatedSprite } from "../../graphics/AnimatedSprite";
import { CharacterSprites } from "../../graphics/CharacterSprite";

const size = {
	width: 187,
	height: 207,
};
const assetUrl = "/game-assets/simple-bulbro-animation-frames.png";
/**
 * Manages a player sprite graphic.
 */
export class SimpleBulbroSprite {
	#gfx: PIXI.Container;
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#movement?: AnimatedSprite;
	#idle?: AnimatedSprite;
	#whenHit?: AnimatedSprite;
	#whenDangerouslyHit?: AnimatedSprite;
	#characterSprites?: CharacterSprites;

	#idleFrames = [
		{ x: 260, y: 0 },
		{ x: 470, y: 0 },
		{ x: 697, y: 0 },
		{ x: 910, y: 0 },
	];

	#walkingFrames = [
		{ x: 260, y: 0 },
		{ x: 260, y: 221 },
		{ x: 697, y: 221 },
		{ x: 910, y: 221 },
	];

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

	#fullTexture() {
		return PIXI.Assets.load(assetUrl);
	}

	async init() {
		this.#idle = await this.#animationForFrames(this.#idleFrames);
		this.#movement = await this.#animationForFrames(this.#walkingFrames);
		this.#whenHit = this.#idle;

		this.#whenDangerouslyHit = this.#idle;

		this.#characterSprites = new CharacterSprites({
			walking: this.#movement,
			hurt: this.#whenHit,
			hurtALot: this.#whenDangerouslyHit,
			idle: this.#idle,
		});

		this.#sprite.texture = await this.#idle.getSprite(0);
		this.#sprite.scale.set(0.2);
		this.#sprite.x = 8;
		this.#sprite.y = 0;
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
			if (texture) {
				this.#sprite.texture = texture;
			}
		});
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#gfx.parent?.removeChild(this.#gfx);
	}

	#updatePosition(pos: Position, lastDirection?: Direction): void {
		this.#gfx.x = pos.x;
		this.#gfx.y = pos.y;

		if (lastDirection && lastDirection.x < 0) {
			this.#sprite.scale.x = -1 * Math.abs(this.#sprite.scale.x);
			this.#sprite.x = 8;
			this.#sprite.y = 0;
		} else if (lastDirection && lastDirection.x > 0) {
			this.#sprite.x = -20;
			this.#sprite.y = 0;
			this.#sprite.scale.x = Math.abs(this.#sprite.scale.y);
		}
	}

	async #animationForFrames(frames: Position[]) {
		const source = await this.#fullTexture();
		return new AnimatedSprite(
			frames.length,
			(frame) =>
				new PIXI.Texture({
					source,
					frame: new PIXI.Rectangle(
						frames[frame]!.x,
						frames[frame]!.y,
						size.width,
						size.height,
					),
				}),
		);
	}
}
