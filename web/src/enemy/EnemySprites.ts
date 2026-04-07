import { FrameAnimationController } from "@/graphics/FrameAnimationController";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { EnemyState } from "./EnemyState";

const CYCLE_LENGTH = 20;
const MOVING_ANIMATION_DELAY = 100;

type SwingConfig =
	{
		controller: FrameAnimationController;
		swingAmplitude: number;
		dimensions: {
			x: number;
			y: number;
		};
	};

type DeathConfig =
	{
		controller: FrameAnimationController;
		rotationsPerAnimation: number;
	};

export type EnemyAnimations =
	{
		idle: SwingConfig;
		walking: SwingConfig;
		hurt: SwingConfig;
		hurtALot: SwingConfig;
		raging: SwingConfig;
		dead: DeathConfig;
	};

export type EnemyAnimationState =
	{
		kind:
			| "idle"
			| "walking"
			| "hurt"
			| "hurtALot"
			| "dead"
			| "raging";
		/** X scale factor applied to the body sprite (swing effect) */
		scaleX: number;
		/** Y scale factor applied to the body sprite (swing effect) */
		scaleY: number;
		/** Body rotation for death spin */
		rotation: number;
		/** Overall scale reduction for death fade-out (0–1) */
		overallScale: number;
		/** Active visual effect */
		effect:
			| "none"
			| "hit"
			| "rage";
		/** Convolution hit filter intensity (changes per frame) */
		hitFactor: number;
		/** Whether to show rage color overlay (alternates per frame) */
		showRageOverlay: boolean;
	};

function computeSwing(
	frameIndex: number,
	config: SwingConfig,
): {
	scaleX: number;
	scaleY: number;
} {
	const swing =
		config.swingAmplitude *
		Math.sin(
			(frameIndex *
				Math.PI) /
				CYCLE_LENGTH,
		);
	return {
		scaleX:
			1 -
			swing *
				config
					.dimensions
					.x,
		scaleY:
			1 -
			swing *
				config
					.dimensions
					.y,
	};
}

/**
 * Selects and advances the correct animation for an enemy each frame,
 * returning a plain state descriptor instead of a display object.
 */
export class EnemySprites {
	readonly #animations: EnemyAnimations;

	constructor(
		animations: EnemyAnimations,
	) {
		this.#animations =
			animations;
	}

	getState(
		enemy: EnemyState,
		delta: DeltaTime,
		now: NowTime,
	): EnemyAnimationState {
		if (
			enemy.killedAt
		) {
			const frameIndex =
				this.#animations.dead.controller.advance(
					delta,
				);
			const progress =
				frameIndex /
				(this
					.#animations
					.dead
					.controller
					.framesCount -
					1);
			return {
				kind: "dead",
				scaleX: 1,
				scaleY: 1,
				rotation:
					progress *
					this
						.#animations
						.dead
						.rotationsPerAnimation *
					2 *
					Math.PI,
				overallScale:
					1 -
					progress,
				effect:
					"none",
				hitFactor: 0,
				showRageOverlay: false,
			};
		}

		if (
			enemy.lastHitAt &&
			now -
				enemy.lastHitAt <
				MOVING_ANIMATION_DELAY
		) {
			const isMinorHit =
				enemy.healthPoints /
					enemy
						.stats
						.maxHp >=
				0.5;
			const anim =
				isMinorHit
					? this
							.#animations
							.hurt
					: this
							.#animations
							.hurtALot;
			const frameIndex =
				anim.controller.advance(
					delta,
				);
			const {
				scaleX,
				scaleY,
			} =
				computeSwing(
					frameIndex,
					anim,
				);
			return {
				kind: isMinorHit
					? "hurt"
					: "hurtALot",
				scaleX,
				scaleY,
				rotation: 0,
				overallScale: 1,
				effect:
					"hit",
				hitFactor:
					0.5 +
					frameIndex *
						0.1,
				showRageOverlay: false,
			};
		}

		if (
			enemy.isRaging(
				now,
			)
		) {
			const anim =
				this
					.#animations
					.raging;
			const frameIndex =
				anim.controller.advance(
					delta,
				);
			const {
				scaleX,
				scaleY,
			} =
				computeSwing(
					frameIndex,
					anim,
				);
			return {
				kind: "raging",
				scaleX,
				scaleY,
				rotation: 0,
				overallScale: 1,
				effect:
					"rage",
				hitFactor: 0,
				showRageOverlay:
					frameIndex %
						2 ===
					0,
			};
		}

		if (
			now -
				enemy.lastMovedAt <
			MOVING_ANIMATION_DELAY
		) {
			const anim =
				this
					.#animations
					.walking;
			const frameIndex =
				anim.controller.advance(
					delta,
				);
			const {
				scaleX,
				scaleY,
			} =
				computeSwing(
					frameIndex,
					anim,
				);
			return {
				kind: "walking",
				scaleX,
				scaleY,
				rotation: 0,
				overallScale: 1,
				effect:
					"none",
				hitFactor: 0,
				showRageOverlay: false,
			};
		}

		const anim =
			this
				.#animations
				.idle;
		const frameIndex =
			anim.controller.advance(
				delta,
			);
		const {
			scaleX,
			scaleY,
		} =
			computeSwing(
				frameIndex,
				anim,
			);
		return {
			kind: "idle",
			scaleX,
			scaleY,
			rotation: 0,
			overallScale: 1,
			effect:
				"none",
			hitFactor: 0,
			showRageOverlay: false,
		};
	}
}
