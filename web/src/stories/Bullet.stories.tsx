import { StorybookGameScene } from "./StorybookGameScene";
import { createShotState } from "./storyHelpers";

interface BulletStoryProps {
	x: number;
	y: number;
	directionX: number;
	directionY: number;
	canvasScale?: number;
	debug?: boolean;
}

export default {
	title: "Shots/Bullet",
	component: StorybookGameScene,
};

export const Controllable = {
	render: ({ x, y, directionX, directionY, ...args }: BulletStoryProps) => (
		<StorybookGameScene
			state={createShotState([
				{
					id: "bullet-1",
					position: { x, y },
					direction: { x: directionX, y: directionY },
				},
			])}
			{...args}
		/>
	),
	args: {
		x: 1000,
		y: 750,
		directionX: 1,
		directionY: 0,
		canvasScale: 0.9,
		debug: false,
	},
	argTypes: {
		x: {
			control: { type: "range", min: 0, max: 2000, step: 10 },
			description: "X position on playing field",
		},
		y: {
			control: { type: "range", min: 0, max: 1500, step: 10 },
			description: "Y position on playing field",
		},
		directionX: {
			control: { type: "range", min: -1, max: 1, step: 0.1 },
			description: "X direction vector (affects rotation)",
		},
		directionY: {
			control: { type: "range", min: -1, max: 1, step: 0.1 },
			description: "Y direction vector (affects rotation)",
		},
		canvasScale: {
			control: { type: "range", min: 0.2, max: 1.5, step: 0.05 },
			description: "Canvas scale relative to playing field size",
		},
		debug: { control: "boolean" },
	},
};
