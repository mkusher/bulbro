import type { WaveState } from "../waveState";
import type { Logger } from "pino";
import { zeroPoint } from "@/geometry";
import type { AutoCenterOnPlayerCamera } from "./AutoCenterOnPlayerCamera";
import { BaseScene } from "./BaseScene";
import type { DeltaTime } from "@/time";

/**
 * Core scene that handles display of players, enemies, and game objects.
 * Does not include UI elements like timers, health bars, etc.
 * Uses AutoCenterOnPlayerCamera for automatic camera following.
 */
export class Scene extends BaseScene<AutoCenterOnPlayerCamera> {
	constructor(
		logger: Logger,
		debug: boolean,
		camera: AutoCenterOnPlayerCamera,
		scale: number,
	) {
		super(logger, debug, camera, scale);
	}

	/**
	 * Initialize playing field immediately in constructor for production scenes.
	 */
	protected async initializePlayingField(): Promise<void> {
		// For production scenes, initialize playing field synchronously in constructor
		// This is overridden because the base class does async init in init() method
		// but Scene.ts originally did it in constructor
		this.playingFieldTile.init(this.camera.stage, this.groundLayer);
	}

	/**
	 * Updates camera to follow the first player.
	 */
	protected updateCamera(deltaTime: DeltaTime, state: WaveState): void {
		this.camera.update(state.players[0]?.position ?? zeroPoint());
	}

	get camera(): AutoCenterOnPlayerCamera {
		return super.camera;
	}
}
