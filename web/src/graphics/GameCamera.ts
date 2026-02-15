import { AutoCenterOnPlayerCamera } from "./AutoCenterOnPlayerCamera";
import type { Camera } from "./Camera";
import { FadeAwayOnLowHealthCamera } from "./FadeAwayOnLowHealthCamera";
import { PixiAppCamera } from "./PixiAppCamera";

export function createGameCamera(): Camera {
	const pixiApp =
		new PixiAppCamera();
	const autoCenter =
		new AutoCenterOnPlayerCamera(
			pixiApp,
		);
	return new FadeAwayOnLowHealthCamera(
		autoCenter,
	);
}
