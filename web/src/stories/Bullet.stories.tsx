import { StorybookGameScene } from "./StorybookGameScene";
import { createShotState } from "./storyHelpers";

interface BulletStoryProps {
	x: number;
	y: number;
	directionX: number;
	directionY: number;
	debug?: boolean;
	cameraX?: number;
	cameraY?: number;
}

export default {
	title:
		"Shots/Bullet",
	component:
		StorybookGameScene,
};

export const Controllable =
	{
		render:
			({
				x,
				y,
				directionX,
				directionY,
				...args
			}: BulletStoryProps) => (
				<StorybookGameScene
					state={createShotState(
						[
							{
								id: "bullet-1",
								position:
									{
										x,
										y,
									},
								direction:
									{
										x: directionX,
										y: directionY,
									},
							},
						],
					)}
					{...args}
				/>
			),
		args: {
			x: 1000,
			y: 750,
			directionX: 1,
			directionY: 0,
			debug: false,
			cameraX: 1000,
			cameraY: 750,
		},
		argTypes:
			{
				x: {
					control:
						{
							type: "range",
							min: 0,
							max: 2000,
							step: 10,
						},
					description:
						"X position on playing field",
				},
				y: {
					control:
						{
							type: "range",
							min: 0,
							max: 1500,
							step: 10,
						},
					description:
						"Y position on playing field",
				},
				directionX:
					{
						control:
							{
								type: "range",
								min:
									-1,
								max: 1,
								step: 0.1,
							},
						description:
							"X direction vector (affects rotation)",
					},
				directionY:
					{
						control:
							{
								type: "range",
								min:
									-1,
								max: 1,
								step: 0.1,
							},
						description:
							"Y direction vector (affects rotation)",
					},
				debug:
					{
						control:
							"boolean",
					},
				cameraX:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 2000,
								step: 10,
							},
						description:
							"Camera X position (leave unset for auto-center)",
					},
				cameraY:
					{
						control:
							{
								type: "number",
								min: 0,
								max: 1500,
								step: 10,
							},
						description:
							"Camera Y position (leave unset for auto-center)",
					},
			},
	};
