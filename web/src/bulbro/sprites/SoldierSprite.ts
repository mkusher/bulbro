import * as PIXI from "pixi.js";
import type { Position } from "../../geometry";
import { BULBRO_SIZE } from "../../bulbro";
import type { BulbroState } from "../BulbroState";
import { AnimatedSprite } from "../../graphics/AnimatedSprite";
import { CharacterSprites } from "../../graphics/CharacterSprite";

/**
 * Manages a player sprite graphic.
 */
export class SoldierSprite {
	#gfx: PIXI.Container;
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;
	#movement?: AnimatedSprite;
	#idle?: AnimatedSprite;
	#whenHit?: AnimatedSprite;
	#whenDangerouslyHit?: AnimatedSprite;
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
		const offset = 39;
		const level = 100;
		const fullTexture = await PIXI.Assets.load(
			"/assets/Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc/Characters(100x100)/Soldier/Soldier with shadows/Soldier.png",
		);

		this.#movement = new AnimatedSprite(
			8,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						frame * level + offset,
						level + offset,
						BULBRO_SIZE.width,
						BULBRO_SIZE.height,
					),
				}),
		);

		this.#idle = new AnimatedSprite(
			6,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						frame * level + offset,
						offset,
						BULBRO_SIZE.width,
						BULBRO_SIZE.height,
					),
				}),
		);

		this.#whenHit = new AnimatedSprite(
			4,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						frame * level + offset,
						5 * level + offset,
						BULBRO_SIZE.width,
						BULBRO_SIZE.height,
					),
				}),
			75,
			false,
		);

		this.#whenDangerouslyHit = new AnimatedSprite(
			4,
			(frame) =>
				new PIXI.Texture({
					source: fullTexture,
					frame: new PIXI.Rectangle(
						frame * level + offset,
						5 * level + offset,
						BULBRO_SIZE.width,
						BULBRO_SIZE.height,
					),
				}),
			125,
			false,
		);

		this.#characterSprites = new CharacterSprites({
			walking: this.#movement,
			hurt: this.#whenHit,
			hurtALot: this.#whenDangerouslyHit,
			idle: this.#idle,
		});

		this.#sprite.texture = await this.#idle.getSprite(0);
		this.#sprite.scale.set(1.5);
		this.#sprite.x = -20;
		this.#sprite.y = -24;
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void {
		parent.addChild(this.#gfx);
		layer.attach(this.#gfx);
	}

	update(player: BulbroState, delta: number) {
		this.#updatePosition(player.position);

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

	/**
	 * Updates sprite position.
	 */
	#updatePosition(pos: Position): void {
		this.#gfx.x = pos.x;
		this.#gfx.y = pos.y;
	}
}
