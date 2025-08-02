import * as PIXI from "pixi.js";
import type { Direction, Position, Size } from "@/geometry";
import type { EnemyState } from "../EnemyState";
import { AnimatedSprite } from "@/graphics/AnimatedSprite";
import { SwingingAnimation } from "@/graphics/SwingingAnimation";
import { CharacterSprites } from "@/graphics/CharacterSprite";
import { PositionedContainer } from "@/graphics/PositionedContainer";
import { Rectangle as RectangleGfx } from "@/graphics/Rectangle";

import * as enemiesFrames from "./EnemiesFrames";

const bodyFramesUrl = "/game-assets/enemies/all-enemies.png";

type PhysicalRectangle = {
	position: Position;
	size: Size;
	offset?: Position;
};
/**
 * Manages a player sprite graphic.
 */
export class BulbaEnemySprite {
	#positionedContainer: PositionedContainer;
	#sprite!: PIXI.Container;
	#debugSprite?: RectangleGfx;
	#movement?: AnimatedSprite<PIXI.Container>;
	#idle?: AnimatedSprite<PIXI.Container>;
	#dead?: AnimatedSprite<PIXI.Container>;
	#whenHit?: AnimatedSprite<PIXI.Container>;
	#whenDangerouslyHit?: AnimatedSprite<PIXI.Container>;
	#characterSprites?: CharacterSprites<PIXI.Container>;
	#defaultFrame: PhysicalRectangle;

	constructor(type: enemiesFrames.EnemyType, debug?: boolean) {
		this.#positionedContainer = new PositionedContainer(0.2);
		this.#defaultFrame = enemiesFrames[type][0];
		const size = this.#defaultFrame.size;
		if (debug) {
			this.#debugSprite = new RectangleGfx(size, 0xff00ff, 0.9);
		}
		this.init();
	}

	#fullTexture() {
		return PIXI.Assets.load(bodyFramesUrl);
	}

	async init() {
		this.#idle = this.#createSwingingAnimation([this.#defaultFrame], 30, 0.2);
		this.#movement = this.#createSwingingAnimation(
			[this.#defaultFrame],
			15,
			0.3,
		);
		this.#whenHit = this.#createSwingingAnimation(
			[this.#defaultFrame],
			50,
			0.4,
		);

		this.#whenDangerouslyHit = this.#createSwingingAnimation(
			[this.#defaultFrame],
			60,
			0.4,
		);
		this.#dead = this.#createSwingingAnimation([this.#defaultFrame], 100, 0);

		this.#characterSprites = new CharacterSprites({
			walking: this.#movement,
			hurt: this.#whenHit,
			hurtALot: this.#whenDangerouslyHit,
			idle: this.#idle,
			dead: this.#dead,
		});

		this.#sprite = await this.#idle.getSprite(0);
		this.#positionedContainer.addChild(this.#sprite);
		if (this.#debugSprite) {
			this.#debugSprite.appendTo(this.#positionedContainer.container);
			const fullSize = this.#defaultFrame.size;
			this.#debugSprite.position.y = -fullSize.height;
			this.#debugSprite.position.x = -fullSize.width / 2;
		}
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void {
		this.#positionedContainer.appendTo(parent, layer);
	}

	update(player: EnemyState, delta: number) {
		this.#updatePosition(player.position, player.lastDirection);

		this.#characterSprites?.getSprite(player, delta).then((sprite) => {
			if (sprite) {
				if (this.#sprite) {
					sprite.x = this.#sprite.x;
					sprite.y = this.#sprite.y;
					this.#sprite?.removeFromParent();
				}
				this.#sprite = sprite;
				this.#positionedContainer.addChild(sprite);
				this.#updatePosition(player.position, player.lastDirection);
			}
		});
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#positionedContainer.remove();
	}

	#updatePosition(pos: Position, lastDirection?: Direction): void {
		this.#positionedContainer.update(pos, lastDirection);

		if (!this.#sprite) {
			return;
		}

		this.#sprite.y = -this.#defaultFrame.size.height;
		this.#sprite.x = this.#defaultFrame.size.width / 2;
	}

	#createSwingingAnimation(
		body: PhysicalRectangle[],
		amplitude: number,
		frameSpeed: number,
	) {
		const indexInArray = (
			length: number,
			frame: number,
			changeEach: number = 1,
		) => Math.floor(frame / changeEach) % length;
		const swingingWalk = new SwingingAnimation(
			(frame) =>
				this.#cutRectangle(body[indexInArray(body.length, frame, 10)]!),
			amplitude,
			frameSpeed,
		);
		return swingingWalk.createAnimatedSprite();
	}

	async #cutRectangle(rectangle: PhysicalRectangle) {
		const source = await this.#fullTexture();
		const texture = new PIXI.Texture({
			source,
			frame: new PIXI.Rectangle(
				rectangle.position.x,
				rectangle.position.y,
				rectangle.size.width,
				rectangle.size.height,
			),
		});
		const sprite = new PIXI.Sprite({ texture });
		sprite.scale.x = -1 * Math.abs(sprite.scale.x);
		return sprite;
	}
}
