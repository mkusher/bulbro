import { useEffect } from "preact/hooks";
import { babyEnemy } from "@/enemies-definitions/baby";
import { spawnEnemy } from "@/enemy/EnemyState";
import type { WaveState } from "@/waveState";
import { waveState } from "@/waveState";
import { allEnemies } from "../enemies-definitions";
import { StorybookGameScene } from "./StorybookGameScene";
import { createEnemyState } from "./storyHelpers";

export default {
	title:
		"Enemies/BulbaEnemies",
	component:
		StorybookGameScene,
};

const enemies =
	allEnemies;
export const Idle =
	{
		render:
			(
				args: any,
			) => (
				<StorybookGameScene
					initialState={createEnemyState(
						[
							spawnEnemy(
								args.enemyType,
								{
									x: 400,
									y: 350,
								},
								enemies.find(
									(
										e,
									) =>
										e.id ===
										args.enemyType,
								)!,
							),
						],
					)}
					{...args}
				/>
			),
		args: {
			debug: false,
			enemyType:
				babyEnemy.id,
		},
		argTypes:
			{
				enemyType:
					{
						options:
							enemies.map(
								(
									e,
								) =>
									e.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};

export const Walking =
	{
		render:
			(
				args: any,
			) => {
				return (
					<StorybookGameScene
						initialState={createEnemyState(
							[
								spawnEnemy(
									args.enemyType,
									{
										x: 400,
										y: 350,
									},
									enemies.find(
										(
											e,
										) =>
											e.id ===
											args.enemyType,
									)!,
								),
							],
						)}
						{...args}
					/>
				);
			},
		args: {
			debug: false,
			enemyType:
				babyEnemy.id,
		},
		argTypes:
			{
				enemyType:
					{
						options:
							enemies.map(
								(
									e,
								) =>
									e.id,
							),
						control:
							{
								type: "radio",
							},
					},
				debug:
					{
						control:
							"boolean",
					},
			},
	};
