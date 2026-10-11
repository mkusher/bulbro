import type { BulbroState } from "@/bulbro/BulbroState";
import {
	type Direction,
	direction,
	distance,
	normalize,
	type Position,
} from "@/geometry";
import type { NowTime } from "@/time";
import type { EnemyState } from "./EnemyState";
import { ENEMY_SIZE } from "./index";

/** Bulbro is considered moving if it moved within this many ms */
const RECENTLY_MOVED_WINDOW = 150;
/** Share of the predicted movement enemies lead by, keeps attacks dodgeable */
export const LEAD_FACTOR = 0.5;
/** Maximum lead time in ms, avoids aiming absurdly far ahead */
const MAX_LEAD_TIME = 1500;

/**
 * Predicts where the target will be after `leadTime` ms,
 * assuming it keeps moving in its last direction.
 * Standing targets are aimed at directly.
 */
export function predictTargetPosition(
	target: BulbroState,
	now: NowTime,
	leadTime: number,
): Position {
	if (
		now -
			target.lastMovedAt >
		RECENTLY_MOVED_WINDOW
	) {
		return target.position;
	}
	const lead =
		(target.speed *
			Math.min(
				leadTime,
				MAX_LEAD_TIME,
			) *
			LEAD_FACTOR) /
		1000;
	return {
		x:
			target
				.position
				.x +
			target
				.lastDirection
				.x *
				lead,
		y:
			target
				.position
				.y +
			target
				.lastDirection
				.y *
				lead,
	};
}

/** How strongly separation affects the movement direction */
const SEPARATION_WEIGHT = 1.5;

/**
 * Adjusts the desired direction so the enemy steers away from
 * nearby enemies instead of stacking on top of them.
 */
export function withSeparation(
	enemy: EnemyState,
	enemies: EnemyState[],
	desired: Direction,
): Direction {
	// Enemies closer than one body width push each other apart
	const separationRadius =
		ENEMY_SIZE.width;
	let pushX = 0;
	let pushY = 0;
	for (const other of enemies) {
		if (
			other.id ===
				enemy.id ||
			other.killedAt
		)
			continue;
		const d =
			distance(
				enemy.position,
				other.position,
			);
		if (
			d >=
			separationRadius
		)
			continue;
		const away =
			direction(
				other.position,
				enemy.position,
			);
		const strength =
			1 -
			d /
				separationRadius;
		pushX +=
			away.x *
			strength;
		pushY +=
			away.y *
			strength;
	}
	if (
		pushX ===
			0 &&
		pushY ===
			0
	)
		return desired;
	const steered =
		normalize(
			{
				x:
					desired.x +
					pushX *
						SEPARATION_WEIGHT,
				y:
					desired.y +
					pushY *
						SEPARATION_WEIGHT,
			},
		);
	return steered;
}
