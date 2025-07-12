import * as PIXI from "pixi.js";
import type { BulbroState } from "../BulbroState";
import { ChibiSprite } from "./ChibiSprite";

const path =
	"/assets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/Necromancer_of_the_Shadow_1/PNG/PNG Sequences/";

export class NecromancerSprite {
	#chibi: ChibiSprite;

	constructor(debug: boolean) {
		this.#chibi = new ChibiSprite(
			path,
			{
				idle: "Idle/0_Necromancer_of_the_Shadow_Idle_",
				walking: "Running/0_Necromancer_of_the_Shadow_Running_",
				hurt: "Hurt/0_Necromancer_of_the_Shadow_Hurt_",
			},
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
