import { currentState } from "@/currentState";
import { useEffect } from "preact/hooks";
import { StorybookGameScene } from "./StorybookGameScene";
import { createEnemyState } from "./storyHelpers";
import { babyEnemy } from "@/enemies-definitions/baby";
import { spawnEnemy } from "@/enemy/EnemyState";
import { allEnemies } from "../enemies-definitions";

export default {
	title: "Enemies/BulbaEnemies",
	component: StorybookGameScene,
};

const enemies = allEnemies;
export const Idle = {
	render: (args: any) => (
		<StorybookGameScene
			state={createEnemyState([
				spawnEnemy(
					args.enemyType,
					{ x: 1000, y: 750 },
					enemies.find((e) => e.id === args.enemyType),
				),
			])}
			{...args}
		/>
	),
	args: {
		debug: false,
		enemyType: babyEnemy.id,
		cameraX: 1000,
		cameraY: 750,
	},
	argTypes: {
		enemyType: {
			options: enemies.map((e) => e.id),
			control: { type: "radio" },
		},
		debug: { control: "boolean" },
	},
};

export const Walking = {
	render: (args: any) => {
		useEffect(() => {
			currentState.value = createEnemyState([
				spawnEnemy(
					args.enemyType,
					{ x: 1000, y: 750 },
					enemies.find((e) => e.id === args.enemyType),
				),
			]);
		}, []);
		return (
			<StorybookGameScene
				state={currentState.value}
				tick={(delta) => {
					const now = Date.now();
					const elapsed = (now % 3000) / 3000; // 3 second cycle
					const x = 1000 + Math.sin(elapsed * Math.PI * 2) * 100;
					const y = 750 + Math.cos(elapsed * Math.PI * 2) * 50;
					const enemy = currentState.value.enemies[0]!;

					return createEnemyState([enemy.move({ x, y }, now)]);
				}}
				{...args}
			/>
		);
	},
	args: {
		debug: false,
		enemyType: babyEnemy.id,
		cameraX: 1000,
		cameraY: 750,
	},
	argTypes: {
		enemyType: {
			options: enemies.map((e) => e.id),
			control: { type: "radio" },
		},
		debug: { control: "boolean" },
	},
};
