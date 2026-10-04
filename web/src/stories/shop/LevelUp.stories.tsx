import { spawnBulbro } from "@/bulbro/BulbroState";
import { getTotalExperienceForLevel } from "@/bulbro/Levels";
import { wellRoundedBulbro } from "@/characters-definitions";
import { zeroPoint } from "@/geometry";
import { LevelUpLayout } from "@/upgrades/LevelUpLayout";
import { generateUpgradeChoices } from "@/upgrades/Upgrades";

export default {
	title:
		"Shop/LevelUp",
	component:
		LevelUpLayout,
};

const bulbroState =
	spawnBulbro(
		"player-1",
		"normal",
		zeroPoint(),
		0,
		0,
		wellRoundedBulbro,
	).gainMaterials(
		getTotalExperienceForLevel(
			3,
		),
	);

export const SingleLevel =
	{
		render:
			(
				args: any,
			) => (
				<LevelUpLayout
					{...args}
				/>
			),
		args: {
			level: 1,
			pendingLevelUps: 1,
			choices:
				generateUpgradeChoices(
					{
						playerId:
							"player-1",
						level: 1,
						luck: 0,
					},
				),
			bulbroState,
			materials: 10,
			rerollPrice: 2,
		},
	};

export const SeveralLevels =
	{
		render:
			(
				args: any,
			) => (
				<LevelUpLayout
					{...args}
				/>
			),
		args: {
			level: 2,
			pendingLevelUps: 3,
			choices:
				generateUpgradeChoices(
					{
						playerId:
							"player-1",
						level: 2,
						luck: 0,
					},
				),
			bulbroState,
			materials: 10,
			rerollPrice: 2,
		},
	};

export const HighTiers =
	{
		render:
			(
				args: any,
			) => (
				<LevelUpLayout
					{...args}
				/>
			),
		args: {
			level: 27,
			pendingLevelUps: 1,
			choices:
				generateUpgradeChoices(
					{
						playerId:
							"player-1",
						level: 27,
						luck: 300,
					},
				),
			bulbroState,
			materials: 10,
			rerollPrice: 2,
		},
	};

export const LocalCoOp =
	{
		render:
			(
				args: any,
			) => (
				<LevelUpLayout
					{...args}
				/>
			),
		args: {
			level: 1,
			pendingLevelUps: 1,
			choices:
				generateUpgradeChoices(
					{
						playerId:
							"player-2",
						level: 1,
						luck: 0,
					},
				),
			bulbroState,
			playerName:
				"P2: Well Rounded",
		},
	};

export const CannotAffordReroll =
	{
		render:
			(
				args: any,
			) => (
				<LevelUpLayout
					{...args}
				/>
			),
		args: {
			level: 3,
			pendingLevelUps: 1,
			choices:
				generateUpgradeChoices(
					{
						playerId:
							"player-1",
						level: 3,
						luck: 0,
						rerollCount: 4,
					},
				),
			bulbroState,
			materials: 1,
			rerollPrice: 6,
		},
	};
