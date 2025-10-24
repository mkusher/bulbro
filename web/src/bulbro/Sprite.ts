import * as PIXI from "pixi.js";
import type { BulbroState } from "./BulbroState";
import { BulbaSprite, faceTypes, type FaceType } from "./sprites/BulbaSprite";
import type { DeltaTime, NowTime } from "@/time";

export { faceTypes, type FaceType };

/**
 * Manages a player sprite graphic.
 */
export interface BulbroSprite {
	init(b: BulbroState): Promise<void>;

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer: PIXI.RenderLayer): void;

	update(player: BulbroState, delta: DeltaTime, now: NowTime): void;

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void;
}

export function createBulbroSprite(type: FaceType, debugPosition = false) {
	if (faceTypes.includes(type)) {
		return new BulbaSprite(type as FaceType, debugPosition);
	}
	return new BulbaSprite("normal");
}
