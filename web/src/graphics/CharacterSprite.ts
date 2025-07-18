import { AnimatedSprite } from "./AnimatedSprite";
import type { BulbroState } from "../bulbro";
import type { EnemyState } from "../enemy";
import { knockbackSpeed } from "../game-formulas";

type Animations = {
	walking: AnimatedSprite;
	hurt: AnimatedSprite;
	hurtALot?: AnimatedSprite;
	idle?: AnimatedSprite;
	dead?: AnimatedSprite;
};

/**
 * Manages a player sprite graphic.
 */
export class CharacterSprites {
	#animations: Animations;

	constructor(animations: Animations) {
		this.#animations = animations;
	}

	async getSprite(character: BulbroState | EnemyState, delta: number) {
		const now = Date.now();
		const movingAnimationDelay = 100;
		if (character.killedAt && this.#animations.dead) {
			return this.#animations.dead?.getSprite(delta);
		}
		if (character.lastHitAt && now - character.lastHitAt < knockbackSpeed) {
			const anim =
				character.healthPoints / character.stats.maxHp >= 0.5
					? this.#animations.hurt
					: (this.#animations.hurtALot ?? this.#animations.hurt);
			return anim?.getSprite(delta);
		} else if (now - character.lastMovedAt < movingAnimationDelay) {
			return this.#animations.walking.getSprite(delta);
		} else if (this.#animations.idle) {
			return this.#animations.idle.getSprite(delta);
		}

		return this.#animations.walking.getSprite(delta);
	}
}
