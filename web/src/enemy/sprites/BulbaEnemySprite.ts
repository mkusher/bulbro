import * as PIXI from "pixi.js";
import type { Direction, Position, Size } from "@/geometry";
import type { EnemyState } from "../EnemyState";
import { AnimatedSprite } from "@/graphics/AnimatedSprite";
import { SwingingAnimation } from "@/graphics/SwingingAnimation";
import { RotatingDisapperanceAnimation } from "@/graphics/RotatingDisappearanceAnimation";
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
	#frames: PhysicalRectangle[];

	constructor(type: enemiesFrames.EnemyType, debug?: boolean) {
		this.#positionedContainer = new PositionedContainer(new PIXI.Container());
		this.#frames = [...enemiesFrames[type]];
		this.#defaultFrame = this.#frames[0]!;
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
		this.#idle = this.#createSwingingAnimation([this.#defaultFrame], 30, 0.2, {
			x: -0.8,
			y: 1,
		});
		this.#movement = this.#createSwingingAnimation(
			[this.#defaultFrame],
			15,
			0.3,
			{ x: 0.6, y: 1 },
		);
		this.#whenHit = this.#createSwingingAnimation([this.#frames[1]!], 50, 0.4, {
			x: 1,
			y: -0.8,
		});

		this.#whenDangerouslyHit = this.#createSwingingAnimation(
			[this.#frames[1]!],
			60,
			0.4,
		);
		this.#dead = this.#createDeathAnimation([this.#defaultFrame]);

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
		}
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void {
		this.#positionedContainer.appendTo(parent, layer);
	}

	update(enemy: EnemyState, delta: number) {
		const shape = enemy.toMovableObject();
		const rectangle =
			shape.shape.type === "rectangle"
				? shape.shape
				: (() => {
						throw new Error("Is not supported");
					})();
		this.#updatePosition(enemy.position, rectangle, enemy.lastDirection);

		if (this.#debugSprite) {
			this.#debugSprite?.update(rectangle, 0xff00ff, 0.9);
			this.#debugSprite.position.y = -rectangle.height;
			this.#debugSprite.position.x = -rectangle.width / 2;
		}

		this.#characterSprites?.getSprite(enemy, delta).then((sprite) => {
			if (sprite) {
				if (this.#sprite) {
					this.#sprite?.removeFromParent();
				}
				this.#sprite = sprite;
				this.#positionedContainer.addChild(sprite);
				this.#updatePosition(enemy.position, rectangle, enemy.lastDirection);
			}
		});
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#positionedContainer.remove();
	}

	#updatePosition(pos: Position, size: Size, lastDirection?: Direction): void {
		this.#positionedContainer.update(pos, lastDirection);

		if (!this.#sprite) {
			return;
		}
	}

	#createSwingingAnimation(
		body: PhysicalRectangle[],
		amplitude: number,
		frameSpeed: number,
		dimensions?: Position,
	) {
		const indexInArray = (
			length: number,
			frame: number,
			changeEach: number = 1,
		) => Math.floor(frame / changeEach) % length;
		const swingingWalk = new SwingingAnimation(
			(frame) => this.#buildEnemy(body[indexInArray(body.length, frame, 10)]!),
			amplitude,
			frameSpeed,
			dimensions,
		);
		return swingingWalk.createAnimatedSprite();
	}

	#createDeathAnimation(body: PhysicalRectangle[]) {
		const indexInArray = (
			length: number,
			frame: number,
			changeEach: number = 1,
		) => Math.floor(frame / changeEach) % length;
		const animation = new RotatingDisapperanceAnimation(
			(frame) => this.#buildEnemy(body[indexInArray(body.length, frame, 10)]!),
			20,
			2,
		);
		return animation.createAnimatedSprite();
	}

	async #buildEnemy(rectangle: PhysicalRectangle) {
		const container = new PIXI.Container();
		const scaling = new PIXI.Container();
		scaling.scale = 0.22;
		scaling.addChild(await this.#cutRectangle(rectangle));

		container.addChild(scaling);
		scaling.y = -container.height;
		scaling.x = container.width / 2;
		return container;
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
