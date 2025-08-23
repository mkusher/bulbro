import * as PIXI from "pixi.js";
import type { Direction, Position } from "@/geometry";
import type { BulbroState } from "../BulbroState";
import { AnimatedSprite } from "@/graphics/AnimatedSprite";
import { SwingingAnimation } from "@/graphics/SwingingAnimation";
import { CharacterSprites } from "@/graphics/CharacterSprite";
import { PositionedContainer } from "@/graphics/PositionedContainer";
import { Rectangle as RectangleGfx } from "@/graphics/Rectangle";
import { BodySprite } from "./BodySprite.ts";
import { LegsSprite } from "./LegsSprite.ts";
import { FaceSprite, type FaceType } from "./FaceSprite.ts";

const sleep = (delay: number) => new Promise((res) => setTimeout(res, delay));

export { faces, faceTypes, type FaceType } from "./FaceSprite.ts";

const fullSize = {
	width: 190,
	height: 280,
};
/**
 * Manages a player sprite graphic.
 */
export class BulbaSprite {
	#positionedContainer: PositionedContainer = new PositionedContainer(
		new PIXI.Container(),
	);
	#spriteScaling = 0.26;
	#sprite!: PIXI.Container;
	#debugSprite?: RectangleGfx;
	#movement?: AnimatedSprite<PIXI.Container>;
	#idle?: AnimatedSprite<PIXI.Container>;
	#whenHit?: AnimatedSprite<PIXI.Container>;
	#whenDangerouslyHit?: AnimatedSprite<PIXI.Container>;
	#characterSprites?: CharacterSprites<PIXI.Container>;

	#bodySprite: BodySprite = new BodySprite();
	#legsSprite = new LegsSprite();
	#faceSprite: FaceSprite;

	constructor(faceType: FaceType, debug?: boolean) {
		this.#faceSprite = new FaceSprite(faceType);
		if (debug) {
			this.#debugSprite = new RectangleGfx(fullSize, 0x0000ff, 0.9);
		}
		this.init();
	}

	async init() {
		await Promise.all([
			this.#bodySprite.init(),
			this.#legsSprite.init(),
			this.#faceSprite.init(),
		]);
		this.#idle = this.#createSwingingAnimation(40, 0.1);
		this.#movement = this.#createSwingingAnimation(20, 0.2);
		this.#whenHit = this.#createSwingingAnimation(50, 0.25);

		this.#whenDangerouslyHit = this.#createSwingingAnimation(60, 0.3);

		this.#characterSprites = new CharacterSprites({
			walking: this.#movement,
			hurt: this.#whenHit,
			hurtALot: this.#whenDangerouslyHit,
			idle: this.#idle,
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

	update(player: BulbroState, delta: number) {
		this.#updatePosition(player.position, player.lastDirection);

		if (this.#debugSprite) {
			const shape = player.toMovableObject();
			const rectangle =
				shape.shape.type === "rectangle"
					? shape.shape
					: (() => {
							throw new Error("Shape is not supported");
						})();

			this.#debugSprite?.update(rectangle, 0xff00ff, 0.9);
			this.#debugSprite.position.y = -rectangle.height;
			this.#debugSprite.position.x = -rectangle.width / 2;
		}

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
	}

	#createSwingingAnimation(frameSpeed: number, amplitude: number) {
		const swingingWalk = new SwingingAnimation(
			(frame) => this.#buildCharacter(frame),
			frameSpeed,
			amplitude,
			{ x: -0.8, y: 1 },
		);
		return swingingWalk.createAnimatedSprite();
	}

	async #buildCharacter(frame: number) {
		await sleep(1);
		const bodySize = this.#bodySprite.size;
		const character = new PIXI.Container();
		const scaling = new PIXI.Container();
		scaling.scale = this.#spriteScaling;
		character.addChild(scaling);
		this.#bodySprite.appendTo(scaling);
		this.#legsSprite.appendTo(scaling, bodySize);
		this.#faceSprite.appendTo(scaling, bodySize);
		scaling.y = -character.height - 5;
		scaling.x = -character.width / 2;
		return character;
	}
}
