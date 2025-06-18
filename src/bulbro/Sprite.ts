import * as PIXI from "pixi.js";
import type { BulbroState } from "./BulbroState";
import { SoldierSprite } from "./sprites/SoldierSprite";
import { ShooterSprite } from "./sprites/ShooterSprite";
import { DarkOracleSprite } from "./sprites/DarkOracleSprite";

export type SpriteType = "soldier" | "shooter" | "dark oracle";

/**
 * Manages a player sprite graphic.
 */
export interface BulbroSprite {
	init(): Promise<void>;

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container): void;

	update(player: BulbroState, delta: number): void;

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void;
}

export function createBulbroSprite(
	type: SpriteType,
	scale: number,
	debugPosition = false,
) {
	if (type === "shooter") {
		return new ShooterSprite(scale, debugPosition);
	}
	if (type === "dark oracle") {
		return new DarkOracleSprite(scale, debugPosition);
	}
	return new SoldierSprite(scale, debugPosition);
}
