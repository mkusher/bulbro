import type * as PIXI from "pixi.js";
import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type {
	EnemyState,
	EnemyType,
} from "./EnemyState";
import { BulbaEnemySprite } from "./sprites/BulbaEnemySprite";
import {
	type EnemyType as BulbaEnemyType,
	enemyTypes,
} from "./sprites/EnemiesFrames";

/**
 * Manages an enemy sprite graphic.
 */
export interface EnemySprite {
	init(): Promise<void>;

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(
		parent: PIXI.Container,
		layer: PIXI.RenderLayer,
	): void;

	update(
		enemy: EnemyState,
		delta: DeltaTime,
		now: NowTime,
	): void;

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void;
}

export function createEnemySprite(
	type: EnemyType,
	debug: boolean,
): EnemySprite {
	if (
		enemyTypes.includes(
			type as BulbaEnemyType,
		)
	) {
		return new BulbaEnemySprite(
			type as BulbaEnemyType,
			debug,
		);
	}
	return new BulbaEnemySprite(
		"potatoBeetleBaby",
		debug,
	);
}
