import * as PIXI from "pixi.js";
import { GameSprite } from "@/graphics/GameSprite";
import type { DeltaTime } from "@/time";
import { BulletSprite } from "./BulletSprite";
import { EnemyProjectileSprite } from "./EnemyProjectileSprite";
import type { ShotState } from "./ShotState";

export class ShotSprite extends GameSprite {
	#sprite:
		| EnemyProjectileSprite
		| BulletSprite;

	constructor(
		shot: ShotState,
	) {
		super(
			{
				anchor:
					"center",
				direction:
					{
						type: "none",
					},
			},
		);
		this.#sprite =
			shot.shooterType ===
			"player"
				? new BulletSprite(
						shot,
					)
				: new EnemyProjectileSprite(
						shot,
					);
		// Create a graphics container for the child sprite
		const gfx =
			new PIXI.Graphics();
		this.#sprite.appendTo(
			gfx,
		);
		this.addChild(
			gfx,
		);
	}

	/**
	 * Updates sprite position and delegates to child for rotation.
	 */
	update(
		deltaTime: DeltaTime,
		shot: ShotState,
	) {
		this.updatePosition(
			shot.position,
		);
		this.#sprite.update(
			deltaTime,
			shot,
		);
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	override remove(): void {
		this.#sprite.remove();
		super.remove();
	}
}
