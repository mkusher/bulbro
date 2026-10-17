import type { ApplicationOptions } from "pixi.js";

/**
 * Common Pixi.js configuration for optimal rendering.
 * Uses auto-detection to select the best available renderer (WebGL or WebGPU)
 * with high-performance settings.
 */
export const pixiRendererConfig: Partial<ApplicationOptions> =
	{
		powerPreference:
			"high-performance",
		antialias: true,
		// Allow software rendering fallback when hardware acceleration is unavailable
		failIfMajorPerformanceCaveat: false,
		// Render at the device pixel ratio so high-DPI screens (e.g. iPhone at 3x)
		// stay sharp; autoDensity keeps the canvas CSS size in logical pixels.
		resolution:
			typeof window !==
			"undefined"
				? window.devicePixelRatio ||
					1
				: 1,
		autoDensity: true,
	};

/**
 * Creates Pixi.js init options by merging the common config
 * with custom options. Custom options will override defaults.
 */
export function createPixiInitOptions(
	customOptions: Partial<ApplicationOptions>,
): Partial<ApplicationOptions> {
	return {
		...pixiRendererConfig,
		...customOptions,
	};
}
