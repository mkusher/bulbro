import {
	aphidEnemy,
	babyEnemy,
	badger,
	beetleArcher,
	beetleWarrior,
	coloradoBeetle,
	hedghehog,
	roach,
	tree,
	wildBoar,
} from "../enemies-definitions";
import { findBulbroById } from "../characters-definitions";
import { spawnEnemy } from "@/enemy/EnemyState";
import { classicMapSize } from "@/game-canvas";
import {
	createBulbroState,
	createEnemyState,
} from "./storyHelpers";
import { StorybookGameScene } from "./StorybookGameScene";

const MAP_W =
	classicMapSize.width; // 2000
const MAP_H =
	classicMapSize.height; // 1500
const PLAYER_X =
	MAP_W /
	2; // 1000
const PLAYER_Y =
	MAP_H /
	2; // 750

function randomRingPosition(): {
	x: number;
	y: number;
} {
	const angle =
		Math.random() *
		2 *
		Math.PI;
	const radius =
		200 +
		Math.random() *
			400;
	return {
		x: Math.max(
			0,
			Math.min(
				MAP_W,
				PLAYER_X +
					Math.cos(
						angle,
					) *
						radius,
			),
		),
		y: Math.max(
			0,
			Math.min(
				MAP_H,
				PLAYER_Y +
					Math.sin(
						angle,
					) *
						radius,
			),
		),
	};
}

const ENEMY_TYPES =
	[
		{
			argKey:
				"babyCount",
			character:
				babyEnemy,
		},
		{
			argKey:
				"aphidCount",
			character:
				aphidEnemy,
		},
		{
			argKey:
				"beetleWarriorCount",
			character:
				beetleWarrior,
		},
		{
			argKey:
				"coloradoBeetleCount",
			character:
				coloradoBeetle,
		},
		{
			argKey:
				"hedgehogCount",
			character:
				hedghehog,
		},
		{
			argKey:
				"wildBoarCount",
			character:
				wildBoar,
		},
		{
			argKey:
				"badgerCount",
			character:
				badger,
		},
		{
			argKey:
				"roachCount",
			character:
				roach,
		},
		{
			argKey:
				"beetleArcherCount",
			character:
				beetleArcher,
		},
		{
			argKey:
				"treeCount",
			character:
				tree,
		},
	] as const;

function buildInitialState(
	args: Record<
		string,
		| number
		| boolean
	>,
) {
	const bulbro =
		findBulbroById(
			"well-rounded",
		);
	const playerState =
		createBulbroState(
			"stress-test",
			{
				x: PLAYER_X,
				y: PLAYER_Y,
			},
			bulbro,
		);
	const player =
		playerState
			.players[0]!;

	const enemies =
		ENEMY_TYPES.flatMap(
			({
				argKey,
				character,
			}) => {
				const count =
					(args[
						argKey
					] as number) ??
					0;
				return Array.from(
					{
						length:
							count,
					},
					(
						_,
						i,
					) =>
						spawnEnemy(
							`${character.id}-${i}`,
							randomRingPosition(),
							character,
						),
				);
			},
		);

	return createEnemyState(
		enemies,
		{
			players:
				[
					player,
				],
		},
	);
}

export default {
	title:
		"Enemies/StressTest",
	component:
		StorybookGameScene,
};

export const ManyEnemies =
	{
		render:
			(
				args: any,
			) => (
				<StorybookGameScene
					initialState={buildInitialState(
						args,
					)}
					debug={
						args.debug
					}
					enableKeyboard={
						true
					}
					showPlayerStats={
						true
					}
				/>
			),
		args: {
			babyCount: 5,
			aphidCount: 0,
			beetleWarriorCount: 0,
			coloradoBeetleCount: 0,
			hedgehogCount: 0,
			wildBoarCount: 0,
			badgerCount: 0,
			roachCount: 0,
			beetleArcherCount: 0,
			treeCount: 0,
			debug: false,
		},
		argTypes:
			{
				babyCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				aphidCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				beetleWarriorCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				coloradoBeetleCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				hedgehogCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				wildBoarCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				badgerCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				roachCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				beetleArcherCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				treeCount:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 50,
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};
