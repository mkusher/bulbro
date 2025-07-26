import { StorybookGameScene } from "./StorybookGameScene";
import { createEnemyState } from "./storyHelpers";
import { babyEnemy } from "@/enemies-definitions/baby";

export default {
	title: "Enemies/Orc",
	component: StorybookGameScene,
};

export const Idle = {
	render: (args: any) => (
		<StorybookGameScene
			state={createEnemyState([
				{ id: "orc-1", position: { x: 1000, y: 750 }, character: babyEnemy },
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
				{ id: "orc-1", position: { x: 1000, y: 750 }, character: babyEnemy },
			])}
			tick={(delta) => {
				const now = Date.now();
				const elapsed = (now % 2000) / 2000; // 2 second cycle
				const walkX = 1000 + Math.sin(elapsed * Math.PI * 2) * 80;
				const walkY = 750 + Math.cos(elapsed * Math.PI * 2) * 40;

				return createEnemyState([
					{
						id: "orc-1",
						position: { x: walkX, y: walkY },
						character: babyEnemy,
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
