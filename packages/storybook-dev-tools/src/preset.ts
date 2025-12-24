/**
 * Storybook preset - tells Storybook to load the addon
 */

import type { PresetProperty } from "@storybook/types";

/**
 * Preset configuration that loads the manager component
 */
export const presetManager: PresetProperty<
	"manager"
> = async () => {
	return {
		manager:
			[
				new URL(
					"./manager.tsx",
					import.meta
						.url,
				)
					.pathname,
			],
	};
};

/**
 * Default export for Storybook preset
 */
export default {
	manager:
		[
			"./manager",
		],
};
