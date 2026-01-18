import * as PIXI from "pixi.js";
import { Assets } from "@/Assets";
import { GameSprite } from "@/graphics/GameSprite";
import type { DeltaTime } from "@/time";
import type { SpawningEnemy } from "./SpawningEnemyState";

const spriteSize =
	{
		width: 140,
		height: 140,
	};

const spriteScale = 0.2;

// Scaled size for anchor offset calculation
const scaledSpriteSize =
	{
		width:
			spriteSize.width *
			spriteScale,
		height:
			spriteSize.height *
			spriteScale,
	};

/**
 * Manages a spawning enemy portal sprite.
 */
export class SpawningEnemySprite extends GameSprite {
	#sprite: PIXI.Sprite;
	#debugPosition: PIXI.Graphics;

	constructor(
		debug?: boolean,
	) {
		super(
			{
				anchor:
					"bottom-center",
				direction:
					{
						type: "none",
					},
			},
		);
		this.#sprite =
			new PIXI.Sprite();
		this.#sprite.scale.set(
			spriteScale,
		);

		// Apply anchor offset using SCALED size for correct positioning
		const offset =
			this.calculateAnchorOffset(
				scaledSpriteSize,
			);
		this.#sprite.x =
			offset.x;
		this.#sprite.y =
			offset.y;

		this.addChild(
			this
				.#sprite,
		);

		this.#debugPosition =
			new PIXI.Graphics();
		if (
			debug
		) {
			this.#debugPosition.beginFill(
				0x0000ff,
				0.4,
			);
			this.#debugPosition.drawRect(
				-8,
				-8,
				8,
				8,
			);
			this.#debugPosition.endFill();
			this.addChild(
				this
					.#debugPosition,
			);
		}
		this.init();
	}

	async init() {
		const texture =
			await Assets.get(
				"objects",
			);
		this.#sprite.texture =
			new PIXI.Texture(
				{
					source:
						texture,
					frame:
						new PIXI.Rectangle(
							45,
							630,
							spriteSize.width,
							spriteSize.height,
						),
				},
			);
	}

	update(
		spawningEnemy: SpawningEnemy,
		deltaTime: DeltaTime,
	) {
		this.updatePosition(
			spawningEnemy.position,
		);
		this.#sprite.alpha =
			Math.sin(
				(((Date.now() -
					spawningEnemy.startedAt) /
					50) *
					Math.PI) /
					8,
			);
	}
}
