import type { Logger } from "pino";
import type { DeltaTime } from "@/time";
import type { WaveState } from "../waveState";
import { BaseScene } from "./BaseScene";
import type { Camera } from "./Camera";

/**
 * Core scene that handles display of players, enemies, and game objects.
 * Does not include UI elements like timers, health bars, etc.
 */
export class Scene extends BaseScene<Camera> {
	constructor(
		logger: Logger,
		debug: boolean,
		camera: Camera,
		scale: number,
	) {
		super(
			logger,
			debug,
			camera,
			scale,
		);
	}

	/**
	 * Initialize playing field immediately in constructor for production scenes.
	 */
	protected async initializePlayingField(): Promise<void> {
		this.playingFieldTile.init(
			this
				.camera
				.stage,
			this
				.groundLayer,
		);
	}

	protected updateCamera(
		deltaTime: DeltaTime,
		state: WaveState,
	): void {
		this.camera.update(
			state,
		);
	}

	get camera(): Camera {
		return super
			.camera;
	}
}
