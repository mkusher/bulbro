/**
 * Type definitions for the Storybook Dev Tools addon
 */

/**
 * Props passed to GameControlsPanel component
 */
export interface GameControlsPanelProps {}

/**
 * Props passed to GameStatsPanel component
 */
export interface GameStatsPanelProps {}

/**
 * Addon configuration options
 */
export interface AddonOptions {
	/**
	 * Whether to enable keyboard shortcuts
	 * @default true
	 */
	enableKeyboardShortcuts?: boolean;
}
