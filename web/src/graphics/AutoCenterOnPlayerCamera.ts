import type { Position, Size } from "@/geometry";
import { canvasSize, computedMapSizeForWindow } from "@/game-canvas";
import { Camera } from "./Camera";

/**
 * Decorator that adds automatic player centering functionality to a Camera.
 * Centers camera on player position, with map centering fallback for larger screens.
 */
export class AutoCenterOnPlayerCamera extends Camera {
	/**
	 * Updates camera position to center on player.
	 */
	update(playerPosition: Position) {
		this.#moveCamera(playerPosition);
	}

	#moveCamera(playerPosition: Position) {
		if (
			!this.#isSmallScreen(computedMapSizeForWindow.value, canvasSize.value)
		) {
			this.#moveToCenter();
			return;
		}
		const scale = this.stage.scale.x;
		const position = {
			x: playerPosition.x * scale,
			y: playerPosition.y * scale,
		};

		this.stage.x = -position.x + canvasSize.value.width / 2;
		this.stage.y = -position.y + canvasSize.value.height / 2;
	}

	#isSmallScreen(playingFieldSize: Size, canvasSize: Size) {
		return (
			playingFieldSize.width > canvasSize.width ||
			playingFieldSize.height > canvasSize.height
		);
	}

	#moveToCenter() {
		this.stage.x =
			(canvasSize.value.width - computedMapSizeForWindow.value.width) / 2;
		this.stage.y =
			(canvasSize.value.height - computedMapSizeForWindow.value.height) / 2;
	}
}
