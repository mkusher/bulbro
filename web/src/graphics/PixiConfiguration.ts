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
