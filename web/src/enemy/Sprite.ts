import * as PIXI from "pixi.js";
import type { EnemyState, EnemyType } from "./EnemyState";
import { OrcSprite } from "./sprites/OrcSprite";
import { SlimeSprite } from "./sprites/SlimeSprite";
import { BulbaEnemySprite } from "./sprites/BulbaEnemySprite";
import {
	enemyTypes,
	type EnemyType as BulbaEnemyType,
} from "./sprites/EnemiesFrames";

/**
 * Manages an enemy sprite graphic.
 */
export interface EnemySprite {
	init(): Promise<void>;

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void;

	update(enemy: EnemyState, delta: number): void;

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void;
}

export function createEnemySprite(
	type: EnemyType,
	debug: boolean,
): EnemySprite {
	if (enemyTypes.includes(type as BulbaEnemyType)) {
		return new BulbaEnemySprite(type as BulbaEnemyType, debug);
	}
	if (type === "slime") {
		return new SlimeSprite(debug);
	}
	return new OrcSprite(debug);
}
