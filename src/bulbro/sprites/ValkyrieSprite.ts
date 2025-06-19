import * as PIXI from "pixi.js";
import type { BulbroState } from "../BulbroState";
import { ChibiSprite } from "./ChibiSprite";

const path =
	"/assets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/Valkyrie_1/PNG/PNG Sequences/";

export class ValkyrieSprite {
	#chibi: ChibiSprite;

	constructor(scale: number, debug: boolean) {
		this.#chibi = new ChibiSprite(
			path,
			{
				idle: "Idle/0_Valkyrie_Idle_",
				walking: "Running/0_Valkyrie_Running_",
				hurt: "Hurt/0_Valkyrie_Hurt_",
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
