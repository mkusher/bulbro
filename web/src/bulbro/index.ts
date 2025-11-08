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
