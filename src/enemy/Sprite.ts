import * as PIXI from "pixi.js";
import type { EnemyState, EnemyType } from "./EnemyState";
import { OrcSprite } from "./sprites/OrcSprite";

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

export function createEnemySprite(type: EnemyType): EnemySprite {
	return new OrcSprite();
}
