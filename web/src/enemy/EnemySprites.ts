import type * as PIXI from "pixi.js";
import type { AnimatedSprite } from "@/graphics/AnimatedSprite";
import {
	type Animations,
	CharacterSprites,
	type Sprite,
} from "@/graphics/CharacterSprite";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import { knockbackSpeed } from "../game-formulas";
import type { EnemyState } from "./EnemyState";

/**
 * Decorates CharacterSprites with enemy-specific behavior like raging state.
 */
export class EnemySprites<
	R extends
		Sprite<any> = PIXI.Container,
> {
	#ragingAnimation?: AnimatedSprite<R>;
	#animations: Animations<R>;

	constructor(
		animations: Animations<R>,
		ragingAnimation?: AnimatedSprite<R>,
	) {
		this.#animations =
			animations;
		this.#ragingAnimation =
			ragingAnimation;
	}

	async getSprite(
		enemy: EnemyState,
		delta: DeltaTime,
		now: NowTime,
	) {
		const movingAnimationDelay = 100;

		if (
			enemy.killedAt &&
			this
				.#animations
				.dead
		) {
			return this.#animations.dead?.getSprite(
				delta,
			);
		} else if (
			enemy.lastHitAt &&
			now -
				enemy.lastHitAt <
				movingAnimationDelay
		) {
			const anim =
				enemy.healthPoints /
					enemy
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
			enemy.isRaging(
				now,
			) &&
			this
				.#ragingAnimation
		) {
			return this.#ragingAnimation.getSprite(
				delta,
			);
		} else if (
			now -
				enemy.lastMovedAt <
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
