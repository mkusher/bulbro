import { BulbroState } from "../bulbro/BulbroState";
import { baseStats } from "../characters-definitions/base";
import { babyEnemy } from "../enemies-definitions/baby";
import { spawnEnemy } from "../enemy";
import type { WaveState } from "../waveState";
import { StorybookGameScene } from "./StorybookGameScene";
import { createGameState } from "./storyHelpers";

interface FadeAwayCameraStoryProps {
	healthPercent: number;
	debug: boolean;
	enableKeyboard: boolean;
	showPlayerStats: boolean;
	showGameStats: boolean;
	showCoordinateGrid: boolean;
}

const PLAYER_POSITION =
	{
		x: 1000,
		y: 750,
	};

function createFadeAwayState(
	healthPercent: number,
): WaveState {
	const maxHp =
		baseStats.maxHp;
	const healthPoints =
		(healthPercent /
			100) *
		maxHp;

	const player =
		new BulbroState(
			{
				id: "player-1",
				type: "normal",
				position:
					PLAYER_POSITION,
				speed:
					baseStats.speed,
				level: 0,
				totalExperience: 0,
				materialsAvailable: 0,
				healthPoints,
				stats:
					baseStats,
				weapons:
					[],
				lastMovedAt: 0,
				lastHitAt: 0,
				healedByHpRegenerationAt: 0,
				lastDirection:
					{
						x: 0,
						y: 0,
					},
			},
		);

	const enemies =
		[
			spawnEnemy(
				"enemy-1",
				{
					x:
						PLAYER_POSITION.x +
						200,
					y: PLAYER_POSITION.y,
				},
				babyEnemy,
			),
		];

	return createGameState(
		{
			players:
				[
					player,
				],
			enemies,
		},
	);
}

export default {
	title:
		"Camera/Fade Away On Low Health",
	component:
		StorybookGameScene,
};

export const HealthSlider =
	{
		render:
			({
				healthPercent,
				debug,
				...args
			}: FadeAwayCameraStoryProps) => {
				const initialState =
					createFadeAwayState(
						healthPercent,
					);

				return (
					<StorybookGameScene
						initialState={
							initialState
						}
						debug={
							debug
						}
						enableKeyboard={
							args.enableKeyboard
						}
						showPlayerStats={
							args.showPlayerStats
						}
						showGameStats={
							args.showGameStats
						}
						showCoordinateGrid={
							args.showCoordinateGrid
						}
					/>
				);
			},
		args: {
			healthPercent: 25,
			debug: false,
			enableKeyboard: true,
			showPlayerStats: true,
			showGameStats: true,
			showCoordinateGrid: false,
		},
		argTypes:
			{
				healthPercent:
					{
						control:
							{
								type: "range",
								min: 0,
								max: 100,
								step: 5,
							},
						description:
							"Player health percentage. Darkening starts below 50%",
					},
				debug:
					{
						control:
							"boolean",
					},
				enableKeyboard:
					{
						control:
							"boolean",
					},
				showPlayerStats:
					{
						control:
							"boolean",
					},
				showGameStats:
					{
						control:
							"boolean",
					},
				showCoordinateGrid:
					{
						control:
							"boolean",
					},
			},
	};
