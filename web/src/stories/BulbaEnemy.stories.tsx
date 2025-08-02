import { currentState } from "@/currentState";
import { useEffect } from "preact/hooks";
import { StorybookGameScene } from "./StorybookGameScene";
import { createEnemyState } from "./storyHelpers";
import { babyEnemy } from "@/enemies-definitions/baby";
import { type EnemyState, spawnEnemy } from "@/enemy/EnemyState";

export default {
	title: "Enemies/BulbaEnemies",
	component: StorybookGameScene,
};

const enemyId = "potato-beetle-baby";

export const Idle = {
	render: (args: any) => (
		<StorybookGameScene
			state={createEnemyState([
				spawnEnemy(enemyId, { x: 1000, y: 750 }, babyEnemy),
			])}
			{...args}
		/>
	),
	args: {
		debug: false,
		cameraX: 1000,
		cameraY: 750,
	},
	argTypes: {
		debug: { control: "boolean" },
		cameraX: { control: { type: "number", min: 0, max: 2000, step: 10 } },
		cameraY: { control: { type: "number", min: 0, max: 1500, step: 10 } },
	},
};

export const Walking = {
	render: (args: any) => {
		useEffect(() => {
			currentState.value = createEnemyState([
				spawnEnemy(enemyId, { x: 1000, y: 750 }, babyEnemy),
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
		cameraX: 1000,
		cameraY: 750,
	},
	argTypes: {
		debug: { control: "boolean" },
		cameraX: { control: { type: "number", min: 0, max: 2000, step: 10 } },
		cameraY: { control: { type: "number", min: 0, max: 1500, step: 10 } },
	},
};
