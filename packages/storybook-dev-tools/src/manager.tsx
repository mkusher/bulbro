/**
 * Manager component - registers the addon and panels with Storybook
 */

import {
	addons,
	types,
} from "@storybook/manager-api";
import { GameControlsPanel } from "./panels/GameControlsPanel";
import { GameStatsPanel } from "./panels/GameStatsPanel";

export const ADDON_ID =
	"bulbro/game-dev-tools";
export const PANEL_IDS =
	{
		controls: `${ADDON_ID}/controls`,
		stats: `${ADDON_ID}/stats`,
	};

// Register the addon with Storybook
addons.register(
	ADDON_ID,
	() => {
		// Register the Game Controls panel
		addons.add(
			PANEL_IDS.controls,
			{
				title:
					"Game Controls",
				type: types.PANEL,
				render:
					GameControlsPanel,
				icon: "play",
			},
		);

		// Register the Game Stats panel
		addons.add(
			PANEL_IDS.stats,
			{
				title:
					"Game Stats",
				type: types.PANEL,
				render:
					GameStatsPanel,
				icon: "document",
			},
		);
	},
);
