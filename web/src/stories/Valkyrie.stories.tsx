import { StorybookGameScene } from "./StorybookGameScene";
import { createBulbroState } from "./storyHelpers";
import { wellRoundedBulbro } from "@/characters-definitions";

export default {
	title: "Bulbros/Valkyrie",
	component: StorybookGameScene,
};

export const Idle = {
	render: (args: any) => (
		<StorybookGameScene
			state={createBulbroState(
				"valkyrie",
				"valkyrie",
				{ x: 1000, y: 750 },
				wellRoundedBulbro,
			)}
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
			state={createBulbroState(
				"valkyrie",
				"valkyrie",
				{ x: 1000, y: 750 },
				wellRoundedBulbro,
			)}
			tick={(delta) => {
				const now = Date.now();
				const elapsed = (now % 3000) / 3000;
				const walkX = 1000 + Math.sin(elapsed * Math.PI * 2) * 100;
				const walkY = 750 + Math.cos(elapsed * Math.PI * 2) * 50;

				return createBulbroState(
					"valkyrie",
					"valkyrie",
					{ x: walkX, y: walkY },
					wellRoundedBulbro,
				);
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
