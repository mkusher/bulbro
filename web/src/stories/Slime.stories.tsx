import { StorybookGameScene } from "./StorybookGameScene";
import { createEnemyState } from "./storyHelpers";
import { chaserEnemy } from "@/enemies-definitions/chaser";

export default {
	title: "Enemies/Slime",
	component: StorybookGameScene,
};

export const Idle = {
	render: (args: any) => (
		<StorybookGameScene
			state={createEnemyState([
				{
					id: "slime-1",
					position: { x: 1000, y: 750 },
					character: chaserEnemy,
				},
			])}
			{...args}
		/>
	),
	args: {
		canvasScale: 0.6,
		debug: false,
	},
	argTypes: {
		canvasScale: { control: { type: "range", min: 0.2, max: 1.5, step: 0.05 } },
		debug: { control: "boolean" },
	},
};

export const Walking = {
	render: (args: any) => (
		<StorybookGameScene
			state={createEnemyState([
				{
					id: "slime-1",
					position: { x: 1000, y: 750 },
					character: chaserEnemy,
				},
			])}
			tick={(delta) => {
				const now = Date.now();
				const elapsed = (now % 1500) / 1500; // 1.5 second cycle
				const bounceX = 1000 + Math.sin(elapsed * Math.PI * 4) * 60;
				const bounceY = 750 + Math.sin(elapsed * Math.PI * 6) * 35;

				return createEnemyState([
					{
						id: "slime-1",
						position: { x: bounceX, y: bounceY },
						character: chaserEnemy,
					},
				]);
			}}
			{...args}
		/>
	),
	args: {
		canvasScale: 0.6,
		debug: false,
	},
	argTypes: {
		canvasScale: { control: { type: "range", min: 0.2, max: 1.5, step: 0.05 } },
		debug: { control: "boolean" },
	},
};
