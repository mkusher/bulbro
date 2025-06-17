import * as PIXI from "pixi.js";
import type { EnemyState, EnemyType } from "./EnemyState";
import { OrcSprite } from "./sprites/OrcSprite";
import { SlimeSprite } from "./sprites/SlimeSprite";

/**
 * Manages an enemy sprite graphic.
 */
export interface EnemySprite {
	init(): Promise<void>;

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container): void;

	update(enemy: EnemyState, delta: number): void;

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void;
}

export function createEnemySprite(type: EnemyType, scale: number): EnemySprite {
	if (type === "slime") {
		return new SlimeSprite(scale);
	}
	return new OrcSprite(scale);
}
