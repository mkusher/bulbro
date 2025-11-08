import type * as PIXI from "pixi.js";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { BulbroState } from "../bulbro";
import type { EnemyState } from "../enemy";
import { knockbackSpeed } from "../game-formulas";
import type { AnimatedSprite } from "./AnimatedSprite";

export type Sprite<
	R extends
		PIXI.TextureSource,
> =
	| PIXI.Texture<R>
	| PIXI.Container;

export type Animations<
	R extends
		Sprite<any>,
> =
	{
		walking: AnimatedSprite<R>;
		hurt: AnimatedSprite<R>;
		hurtALot?: AnimatedSprite<R>;
		idle?: AnimatedSprite<R>;
		dead?: AnimatedSprite<R>;
	};

/**
 * Manages a player sprite graphic.
 */
export class CharacterSprites<
	R extends
		Sprite<any> = PIXI.Texture,
> {
	#animations: Animations<R>;

	constructor(
		animations: Animations<R>,
	) {
		this.#animations =
			animations;
	}

	async getSprite(
		character:
			| BulbroState
			| EnemyState,
		delta: DeltaTime,
		now: NowTime,
	) {
		const movingAnimationDelay = 100;
		if (
			character.killedAt &&
			this
				.#animations
				.dead
		) {
			return this.#animations.dead?.getSprite(
				delta,
			);
		}
		if (
			character.lastHitAt &&
			now -
				character.lastHitAt <
				knockbackSpeed
		) {
			const anim =
				character.healthPoints /
					character
						.stats
						.maxHp >=
				0.5
					? this
							.#animations
							.hurt
					: (this
							.#animations
							.hurtALot ??
						this
							.#animations
							.hurt);
			return anim?.getSprite(
				delta,
			);
		} else if (
			now -
				character.lastMovedAt <
			movingAnimationDelay
		) {
			return this.#animations.walking.getSprite(
				delta,
			);
		} else if (
			this
				.#animations
				.idle
		) {
			return this.#animations.idle.getSprite(
				delta,
			);
		}

		return this.#animations.walking.getSprite(
			delta,
		);
	}
}
