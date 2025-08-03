import { currentState } from "@/currentState";
import { StorybookGameScene } from "./StorybookGameScene";
import { BulbroSpriteRenderer } from "../ui/BulbroSpriteRenderer";
import { createBulbroState, createGameState } from "./storyHelpers";
import { wellRoundedBulbro } from "@/characters-definitions";
import { classicMapSize } from "@/game-canvas";
import { useEffect } from "preact/hooks";
import { faceTypes, type FaceType } from "../bulbro/sprites/BulbaSprite";

export default {
	title: "Bulbros/Bulba",
	component: StorybookGameScene,
};

const createState = (faceType: FaceType) =>
	createBulbroState(faceType, faceType, { x: 1000, y: 750 }, wellRoundedBulbro);

export const Idle = {
	render: (args: any) => (
		<StorybookGameScene
			state={createState(args.faceType)}
			debug={args.debug}
			cameraX={classicMapSize.width / 2}
			cameraY={classicMapSize.height / 2}
			{...args}
		/>
	),
	args: {
		faceType: "normal",
		debug: false,
	},
	argTypes: {
		faceType: {
			options: faceTypes,
			control: { type: "radio" },
		},
		debug: { control: "boolean" },
	},
};

export const WalkingInCircle = {
	render: (args: any) => {
		useEffect(() => {
			currentState.value = createState(args.faceType);
		}, []);
		return (
			<StorybookGameScene
				state={currentState.value}
				debug={args.debug}
				tick={(delta) => {
					// Create walking movement by updating position
					const now = Date.now();
					const elapsed = (now % 3000) / 3000; // 3 second cycle
					const x = 1000 + Math.sin(elapsed * Math.PI * 2) * 100;
					const y = 750 + Math.cos(elapsed * Math.PI * 2) * 50;
					const player = currentState.value.players[0]!;
					return createGameState({
						players: [player.move({ x, y }, now)],
					});
				}}
				cameraX={classicMapSize.width / 2}
				cameraY={classicMapSize.height / 2}
				{...args}
			/>
		);
	},
	args: {
		faceType: "normal",
		debug: false,
	},
	argTypes: {
		faceType: {
			options: faceTypes,
			control: { type: "radio" },
		},
		debug: { control: "boolean" },
	},
};

export const WalkingAtTheSamePoint = {
	render: (args: any) => {
		useEffect(() => {
			currentState.value = createState(args.faceType);
		}, []);
		return (
			<StorybookGameScene
				state={currentState.value}
				debug={args.debug}
				tick={(delta) => {
					// Create walking movement by updating position
					const now = Date.now();
					const elapsed = (now % 3000) / 3000; // 3 second cycle
					const x = 100 + Math.sin(elapsed * Math.PI * 2) * 10;
					const y = 50 + Math.cos(elapsed * Math.PI * 2) * 5;
					const player = currentState.value.players[0]!;
					return createGameState({
						players: [player.move({ x, y }, now)],
					});
				}}
				cameraX={classicMapSize.width / 2}
				cameraY={classicMapSize.height / 2}
				{...args}
			/>
		);
	},
	args: {
		faceType: "normal",
		debug: false,
	},
	argTypes: {
		faceType: {
			options: faceTypes,
			control: { type: "radio" },
		},
		debug: { control: "boolean" },
	},
};

export const SimpleRenderer = {
	render: (args: any) => (
		<BulbroSpriteRenderer
			spriteType="bulba"
			bulbro={wellRoundedBulbro}
			{...args}
		/>
	),
	args: {
		width: 400,
		height: 300,
		debug: false,
		centerSprite: true,
		backgroundColor: 0x222222,
	},
	argTypes: {
		width: { control: { type: "range", min: 200, max: 800, step: 50 } },
		height: { control: { type: "range", min: 150, max: 600, step: 50 } },
		debug: { control: "boolean" },
		centerSprite: { control: "boolean" },
		backgroundColor: { control: "color" },
	},
};
