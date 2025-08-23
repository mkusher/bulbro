import * as PIXI from "pixi.js";
import type { BulbroState } from "./BulbroState";
import { SimpleBulbroSprite } from "./sprites/SimpleBulbroSprite";
import { BulbaSprite, faceTypes, type FaceType } from "./sprites/BulbaSprite";

export const bulbrosStyles = [...faceTypes] as const;
export type SpriteType = (typeof bulbrosStyles)[number];

/**
 * Manages a player sprite graphic.
 */
export interface BulbroSprite {
	init(): Promise<void>;

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void;

	update(player: BulbroState, delta: number): void;

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void;
}

export function createBulbroSprite(type: SpriteType, debugPosition = false) {
	if (faceTypes.includes(type)) {
		return new BulbaSprite(type as FaceType, debugPosition);
	}
	return new SimpleBulbroSprite(debugPosition);
}
