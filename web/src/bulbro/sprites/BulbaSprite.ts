import * as PIXI from "pixi.js";
import type { Direction, Position, Size } from "@/geometry";
import type { BulbroState } from "../BulbroState";
import { AnimatedSprite } from "@/graphics/AnimatedSprite";
import { SwingingAnimation } from "@/graphics/SwingingAnimation";
import { CharacterSprites } from "@/graphics/CharacterSprite";
import { PositionedContainer } from "@/graphics/PositionedContainer";
import { Rectangle as RectangleGfx } from "@/graphics/Rectangle";
import { faces, legs, type FaceType } from "./BulbaBodyParts";

export { type FaceType, faceTypes } from "./BulbaBodyParts";

const bodyFramesUrl = "/game-assets/bulbros/bulbro-frames.png";

type PhysicalRectangle = {
	position: Position;
	size: Size;
	offset?: Position;
};

const fullSize = {
	width: 190,
	height: 280,
};
/**
 * Manages a player sprite graphic.
 */
export class BulbaSprite {
	#positionedContainer: PositionedContainer;
	#sprite!: PIXI.Container;
	#debugSprite?: RectangleGfx;
	#movement?: AnimatedSprite<PIXI.Container>;
	#idle?: AnimatedSprite<PIXI.Container>;
	#whenHit?: AnimatedSprite<PIXI.Container>;
	#whenDangerouslyHit?: AnimatedSprite<PIXI.Container>;
	#characterSprites?: CharacterSprites<PIXI.Container>;

	#baseShape = {
		position: {
			x: 24,
			y: 10,
		},
		size: {
			width: 140,
			height: 160,
		},
	};

	#faceType: FaceType;

	constructor(faceType: FaceType, debug?: boolean) {
		this.#positionedContainer = new PositionedContainer(0.2);
		this.#faceType = faceType;
		if (debug) {
			this.#debugSprite = new RectangleGfx(fullSize, 0x0000ff, 0.9);
		}
		this.init();
	}

	#fullTexture() {
		return PIXI.Assets.load(bodyFramesUrl);
	}

	async init() {
		const body = [this.#baseShape];
		const idleLegs = [legs[0]];
		const face = [faces[this.#faceType]];
		this.#idle = this.#createSwingingAnimation(body, idleLegs, face, 30, 0.1);
		this.#movement = this.#createSwingingAnimation(
			body,
			[legs[3], legs[4], legs[6], legs[4]],
			face,
			15,
			0.1,
		);
		this.#whenHit = this.#createSwingingAnimation(
			body,
			idleLegs,
			face,
			50,
			0.25,
		);

		this.#whenDangerouslyHit = this.#createSwingingAnimation(
			body,
			idleLegs,
			face,
			60,
			0.3,
		);

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

	update(player: BulbroState, delta: number) {
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

		this.#sprite.y = -210;

		this.#sprite.x = -fullSize.width / 2;
	}

	#createSwingingAnimation(
		body: PhysicalRectangle[],
		legsFrames: PhysicalRectangle[],
		face: PhysicalRectangle[],
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
				this.#buildCharacter(
					body[indexInArray(body.length, frame, 10)]!,
					legsFrames[indexInArray(legsFrames.length, frame, 10)]!,
					face[indexInArray(face.length, frame, 10)]!,
				),
			amplitude,
			frameSpeed,
		);
		return swingingWalk.createAnimatedSprite();
	}
	async #buildCharacter(
		bodyShape: PhysicalRectangle,
		legsShape: PhysicalRectangle,
		faceShape: PhysicalRectangle,
	) {
		const body = await this.#cutRectangle(bodyShape);
		const legs = await this.#cutRectangle(legsShape);
		legs.x = 10;
		legs.y = bodyShape.size.height - legsShape.size.height * 0.4;
		const face = await this.#cutRectangle(faceShape);
		face.scale = 0.85;
		const faceOffset = faceShape.offset;
		if (faceOffset) {
			face.x = faceOffset.x;
			face.y = faceOffset.y;
		} else {
			face.x = 5;
			face.y = bodyShape.size.height * 0.4;
		}
		const character = new PIXI.Container();
		character.addChild(body);
		character.addChild(legs);
		character.addChild(face);
		return character;
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
		return new PIXI.Sprite({ texture });
	}
}
