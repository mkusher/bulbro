import { babyEnemy } from "@/enemies-definitions/baby";
import { spawnEnemy } from "@/enemy/EnemyState";
import { requireDefined } from "@/requireDefined";
import { allEnemies } from "../enemies-definitions";
import { StorybookGameScene } from "./StorybookGameScene";
import { createEnemyState } from "./storyHelpers";

export default {
	title:
		"Game Scenes/Enemies",
	component:
		StorybookGameScene,
};

const enemies =
	allEnemies;
const idleArgs =
	{
		debug: false,
		enemyType:
			babyEnemy.id,
	};

export const Idle =
	{
		render:
			(
				args: typeof idleArgs,
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
								requireDefined(
									enemies.find(
										(
											e,
										) =>
											e.id ===
											args.enemyType,
									),
								),
							),
						],
					)}
					{...args}
				/>
			),
		args: idleArgs,
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

const walkingArgs =
	{
		debug: false,
		enemyType:
			babyEnemy.id,
	};

export const Walking =
	{
		render:
			(
				args: typeof walkingArgs,
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
									requireDefined(
										enemies.find(
											(
												e,
											) =>
												e.id ===
												args.enemyType,
										),
									),
								),
							],
						)}
						{...args}
					/>
				);
			},
		args: walkingArgs,
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
