import { spawnBulbro } from "../bulbro/BulbroState";
import { bulbros } from "../characters-definitions";
import { wellRoundedBulbro } from "../characters-definitions/well-rounded";
import {
	aphidEnemy,
	beetleWarrior,
} from "../enemies-definitions";
import { babyEnemy } from "../enemies-definitions/baby";
import { spawnEnemy } from "../enemy";
import type { WaveState } from "../waveState";
import { weapons } from "../weapons-definitions";
import { StorybookGameScene } from "./StorybookGameScene";
import { createGameState } from "./storyHelpers";

export default {
	title:
		"Game Scenes/Combat Scenarios",
	component:
		StorybookGameScene,
};

const defaults =
	{
		args: {
			bulbroX: 400,
			bulbroY: 300,
			enemyX: 600,
			enemyY: 300,
			debug: false,
			enableKeyboard: true,
			showPlayerStats: true,
			showGameStats: true,
			showTouchControls: false,
			showCoordinateGrid: false,
			bulbroType:
				"well-rounded",
		},
		argTypes:
			{
				bulbroX:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 800,
							},
					},
				bulbroY:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 600,
							},
					},
				enemyX:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 800,
							},
					},
				enemyY:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 600,
							},
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
				showTouchControls:
					{
						control:
							"boolean",
					},
				showCoordinateGrid:
					{
						control:
							"boolean",
					},
				bulbroType:
					{
						options:
							bulbros.map(
								(
									b,
								) =>
									b.id,
							),
						control:
							{
								type: "select",
							},
					},
			},
	};

export const BulbroVsBaby =
	{
		render:
			(
				args: any,
			) => {
				const bulbroPosition =
					{
						x: args.bulbroX,
						y: args.bulbroY,
					};
				const enemyPosition =
					{
						x: args.enemyX,
						y: args.enemyY,
					};

				const selectedBulbro =
					bulbros.find(
						(
							b,
						) =>
							b.id ===
							args.bulbroType,
					) ||
					wellRoundedBulbro;

				const bulbro =
					spawnBulbro(
						"player-1",
						"normal",
						bulbroPosition,
						0,
						0,
						{
							...selectedBulbro,
							weapons:
								[
									...selectedBulbro.defaultWeapons,
								],
						},
					);

				const enemy =
					spawnEnemy(
						"enemy-1",
						enemyPosition,
						babyEnemy,
					);

				const gameState: WaveState =
					createGameState(
						{
							players:
								[
									bulbro,
								],
							enemies:
								[
									enemy,
								],
						},
					);

				return (
					<div
						style={{
							height:
								"100vh",
							width:
								"100%",
						}}
					>
						<StorybookGameScene
							initialState={
								gameState
							}
							backgroundColor={
								0x2a4d3a
							}
							debug={
								args.debug
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
							showTouchControls={
								args.showTouchControls
							}
							showCoordinateGrid={
								args.showCoordinateGrid
							}
						/>
					</div>
				);
			},
		...defaults,
	};

export const BulbroVsAphid =
	{
		render:
			(
				args: any,
			) => {
				const bulbroPosition =
					{
						x: args.bulbroX,
						y: args.bulbroY,
					};
				const enemyPosition =
					{
						x: args.enemyX,
						y: args.enemyY,
					};

				const selectedBulbro =
					bulbros.find(
						(
							b,
						) =>
							b.id ===
							args.bulbroType,
					) ||
					wellRoundedBulbro;

				const bulbro =
					spawnBulbro(
						"player-1",
						"normal",
						bulbroPosition,
						0,
						0,
						{
							...selectedBulbro,
							weapons:
								[
									...selectedBulbro.defaultWeapons,
								],
						},
					);

				const enemy =
					spawnEnemy(
						"enemy-1",
						enemyPosition,
						aphidEnemy,
					);

				const gameState: WaveState =
					createGameState(
						{
							players:
								[
									bulbro,
								],
							enemies:
								[
									enemy,
								],
						},
					);

				return (
					<div
						style={{
							height:
								"100vh",
							width:
								"100%",
						}}
					>
						<StorybookGameScene
							initialState={
								gameState
							}
							backgroundColor={
								0x2a4d3a
							}
							debug={
								args.debug
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
							showTouchControls={
								args.showTouchControls
							}
							showCoordinateGrid={
								args.showCoordinateGrid
							}
						/>
					</div>
				);
			},
		...defaults,
	};

export const BulbroVsBeetleWarrior =
	{
		render:
			(
				args: any,
			) => {
				const bulbroPosition =
					{
						x: args.bulbroX,
						y: args.bulbroY,
					};
				const enemyPosition =
					{
						x: args.enemyX,
						y: args.enemyY,
					};

				const selectedBulbro =
					bulbros.find(
						(
							b,
						) =>
							b.id ===
							args.bulbroType,
					) ||
					wellRoundedBulbro;

				const bulbro =
					spawnBulbro(
						"player-1",
						"normal",
						bulbroPosition,
						0,
						0,
						{
							...selectedBulbro,
							weapons:
								[
									...selectedBulbro.defaultWeapons,
								],
						},
					);

				const enemy =
					spawnEnemy(
						"enemy-1",
						enemyPosition,
						beetleWarrior,
					);

				const gameState: WaveState =
					createGameState(
						{
							players:
								[
									bulbro,
								],
							enemies:
								[
									enemy,
								],
						},
					);

				return (
					<div
						style={{
							height:
								"100vh",
							width:
								"100%",
						}}
					>
						<StorybookGameScene
							initialState={
								gameState
							}
							backgroundColor={
								0x2a4d3a
							}
							debug={
								args.debug
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
							showTouchControls={
								args.showTouchControls
							}
							showCoordinateGrid={
								args.showCoordinateGrid
							}
						/>
					</div>
				);
			},
		...defaults,
	};

export const BulbroVsMultipleEnemies =
	{
		render:
			(
				args: any,
			) => {
				const bulbroPosition =
					{
						x: 400,
						y: 300,
					};

				const selectedBulbro =
					bulbros.find(
						(
							b,
						) =>
							b.id ===
							args.bulbroType,
					) ||
					wellRoundedBulbro;

				const bulbro =
					spawnBulbro(
						"player-1",
						"normal",
						bulbroPosition,
						0,
						0,
						{
							...selectedBulbro,
							weapons:
								[
									...selectedBulbro.defaultWeapons,
								],
						},
					);

				const enemies =
					[
						spawnEnemy(
							"enemy-1",
							{
								x: 200,
								y: 200,
							},
							babyEnemy,
						),
						spawnEnemy(
							"enemy-2",
							{
								x: 600,
								y: 200,
							},
							babyEnemy,
						),
						spawnEnemy(
							"enemy-3",
							{
								x: 200,
								y: 400,
							},
							aphidEnemy,
						),
						spawnEnemy(
							"enemy-4",
							{
								x: 600,
								y: 400,
							},
							aphidEnemy,
						),
					];

				const gameState: WaveState =
					createGameState(
						{
							players:
								[
									bulbro,
								],
							enemies,
						},
					);

				return (
					<div
						style={{
							height:
								"100vh",
							width:
								"100%",
						}}
					>
						<StorybookGameScene
							initialState={
								gameState
							}
							backgroundColor={
								0x2a4d3a
							}
							debug={
								args.debug
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
							showTouchControls={
								args.showTouchControls
							}
							showCoordinateGrid={
								args.showCoordinateGrid
							}
						/>
					</div>
				);
			},
		args: {
			debug: false,
			enableKeyboard: true,
			showPlayerStats: true,
			showGameStats: true,
			showTouchControls: false,
			showCoordinateGrid: false,
			bulbroType:
				"well-rounded",
		},
		argTypes:
			{
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
				showTouchControls:
					{
						control:
							"boolean",
					},
				showCoordinateGrid:
					{
						control:
							"boolean",
					},
				bulbroType:
					{
						options:
							bulbros.map(
								(
									b,
								) =>
									b.id,
							),
						control:
							{
								type: "select",
							},
					},
			},
	};

export const FullyLoadedBulbro =
	{
		render:
			(
				args: any,
			) => {
				const bulbroPosition =
					{
						x: 400,
						y: 300,
					};
				const enemyPosition =
					{
						x: 600,
						y: 300,
					};

				const selectedBulbro =
					bulbros.find(
						(
							b,
						) =>
							b.id ===
							args.bulbroType,
					) ||
					wellRoundedBulbro;
				const selectedWeapons =
					weapons
						.slice(
							0,
							6,
						)
						.map(
							(
								w,
							) =>
								w,
						);

				const bulbro =
					spawnBulbro(
						"player-1",
						"normal",
						bulbroPosition,
						0,
						0,
						{
							...selectedBulbro,
							weapons:
								selectedWeapons,
						},
					);

				const enemy =
					spawnEnemy(
						"enemy-1",
						enemyPosition,
						beetleWarrior,
					);

				const gameState: WaveState =
					createGameState(
						{
							players:
								[
									bulbro,
								],
							enemies:
								[
									enemy,
								],
						},
					);

				return (
					<div
						style={{
							height:
								"100vh",
							width:
								"100%",
						}}
					>
						<StorybookGameScene
							initialState={
								gameState
							}
							backgroundColor={
								0x2a4d3a
							}
							debug={
								args.debug
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
							showTouchControls={
								args.showTouchControls
							}
							showCoordinateGrid={
								args.showCoordinateGrid
							}
						/>
					</div>
				);
			},
		args: {
			debug: false,
			enableKeyboard: true,
			showPlayerStats: true,
			showGameStats: true,
			showTouchControls: false,
			showCoordinateGrid: false,
			bulbroType:
				"well-rounded",
		},
		argTypes:
			{
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
				showTouchControls:
					{
						control:
							"boolean",
					},
				showCoordinateGrid:
					{
						control:
							"boolean",
					},
				bulbroType:
					{
						options:
							bulbros.map(
								(
									b,
								) =>
									b.id,
							),
						control:
							{
								type: "select",
							},
					},
			},
	};
