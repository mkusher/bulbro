import type { Size } from "@/geometry";
import * as enemiesFrames from "./sprites/EnemiesFrames";
import type { EnemyType } from "./sprites/EnemiesFrames";

/** Scale at which enemy body frames are drawn. */
export const ENEMY_BODY_SCALE = 0.3;

/**
 * Size of the enemy's drawn body. Smaller than the collision hitbox
 * (`ENEMY_SIZE`), used where bodies must visually touch.
 */
export function enemyBodySize(
	type: EnemyType,
): Size {
	const {
		size,
	} =
		enemiesFrames[
			type
		];
	return {
		width:
			size.width *
			ENEMY_BODY_SCALE,
		height:
			size.height *
			ENEMY_BODY_SCALE,
	};
}
