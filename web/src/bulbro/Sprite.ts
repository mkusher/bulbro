import * as PIXI from "pixi.js";
import type { BulbroState } from "./BulbroState";
import { SoldierSprite } from "./sprites/SoldierSprite";
import { ShooterSprite } from "./sprites/ShooterSprite";
import { DarkOracleSprite } from "./sprites/DarkOracleSprite";
import { NecromancerSprite } from "./sprites/NecromancerSprite";
import { ValkyrieSprite } from "./sprites/ValkyrieSprite";
import { SimpleBulbroSprite } from "./sprites/SimpleBulbroSprite";

export const bulbrosStyles = [
	"soldier",
	"shooter",
	"dark oracle",
	"necromancer",
	"valkyrie",
	"simple bulbro",
] as const;
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
	if (type === "shooter") {
		return new ShooterSprite(debugPosition);
	}
	if (type === "dark oracle") {
		return new DarkOracleSprite(debugPosition);
	}
	if (type === "necromancer") {
		return new NecromancerSprite(debugPosition);
	}
	if (type === "valkyrie") {
		return new ValkyrieSprite(debugPosition);
	}
	if (type === "soldier") {
		return new SoldierSprite(debugPosition);
	}
	return new SimpleBulbroSprite(debugPosition);
}
