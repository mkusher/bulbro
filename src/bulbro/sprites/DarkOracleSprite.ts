import * as PIXI from "pixi.js";
import type { BulbroState } from "../BulbroState";
import { ChibiSprite } from "./ChibiSprite";

const path =
	"/assets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/Dark_Oracle_1/PNG/PNG Sequences/";

export class DarkOracleSprite {
	#chibi: ChibiSprite;

	constructor(scale: number, debug: boolean) {
		this.#chibi = new ChibiSprite(
			path,
			{
				idle: "Idle/0_Dark_Oracle_Idle_",
				walking: "Running/0_Dark_Oracle_Running_",
				hurt: "Hurt/0_Dark_Oracle_Hurt_",
			},
			scale,
			debug,
		);
		this.init();
	}

	init() {
		return this.#chibi.init();
	}

	/**
	 * Adds this sprite to a PIXI container.
	 */
	appendTo(parent: PIXI.Container, layer: PIXI.IRenderLayer): void {
		this.#chibi.appendTo(parent, layer);
	}

	update(player: BulbroState, delta: number) {
		this.#chibi.update(player, delta);
	}

	/**
	 * Removes this sprite from its parent container.
	 */
	remove(): void {
		this.#chibi.remove();
	}
}
