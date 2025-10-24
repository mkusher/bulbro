import type { WaveState } from "../waveState";
import type { Logger } from "pino";
import type { Camera } from "./Camera";
import { BaseScene } from "./BaseScene";
import type { DeltaTime } from "@/time";

/**
 * Storybook scene that handles display of players, enemies, and game objects.
 * Uses generic Camera for manual positioning in stories.
 */
export class StorybookScene extends BaseScene<Camera> {
	constructor(logger: Logger, debug: boolean, camera: Camera, scale: number) {
		super(logger, debug, camera, scale);
	}

	/**
	 * Storybook scenes don't update camera automatically - manual control in stories.
	 */
	protected updateCamera(deltaTime: DeltaTime, state: WaveState): void {
		// Note: No automatic camera update - storybooks control camera manually
	}

	/**
	 * Enable console logging for storybook debugging.
	 */
	protected logSpriteCreation(
		type: "player" | "enemy",
		id: string,
		position: any,
		totalSprites: number,
	): void {
		console.log(`Creating sprite for ${type} ${id} at position`, position);
		console.log(
			`${type} sprite ${id} added to scene, total sprites: ${totalSprites}`,
		);
	}

	get camera(): Camera {
		return super.camera;
	}
}
