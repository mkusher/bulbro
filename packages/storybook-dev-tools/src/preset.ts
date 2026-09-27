/**
 * Storybook preset - tells Storybook to load the addon
 */

/** Register the manager entry with Storybook 10's preset API. */
export const managerEntries =
	(
		entries: string[] = [],
	) => [
		...entries,
		new URL(
			"./manager.tsx",
			import.meta
				.url,
		)
			.pathname,
	];
