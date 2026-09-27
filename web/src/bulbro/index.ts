import type { Size } from "../geometry";
import type {
	Bulbro,
	Stats,
} from "./BulbroCharacter";
import {
	BulbroState,
	spawnBulbro,
} from "./BulbroState";

export type { BulbroSprite } from "./Sprite";

export type {
	Stats,
	Bulbro,
};
export {
	BulbroState,
	spawnBulbro,
};
export const BULBRO_SIZE: Size =
	{
		width: 90,
		height: 60,
	};

/**
 * Size of the bulbro's drawn body (the 100x130 body sprite at 0.3 scale).
 * Smaller than the collision hitbox (`BULBRO_SIZE`), used where bodies must
 * visually touch.
 */
export const BULBRO_BODY_SIZE: Size =
	{
		width: 30,
		height: 39,
	};
