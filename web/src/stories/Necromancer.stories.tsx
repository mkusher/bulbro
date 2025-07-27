import { currentState } from "@/currentState";
import { StorybookGameScene } from "./StorybookGameScene";
import { createBulbroState, createGameState } from "./storyHelpers";
import { wellRoundedBulbro } from "@/characters-definitions";
import { classicMapSize } from "@/game-canvas";
import { useEffect } from "preact/hooks";

export default {
	title: "Bulbros/Necromancer",
	component: StorybookGameScene,
};

export const Idle = {
	render: (args: any) => (
		<StorybookGameScene
			state={createBulbroState(
				"necromancer",
				"necromancer",
				{ x: 1000, y: 750 },
				wellRoundedBulbro,
			)}
			{...args}
		/>
	),
	args: {
		debug: false,
	},
	argTypes: {
		debug: { control: "boolean" },
	},
};

export const Walking = {
	render: (args: any) => {
		useEffect(() => {
			currentState.value = createBulbroState(
				"necromancer",
				"necromancer",
				{ x: 1000, y: 750 },
				wellRoundedBulbro,
			);
		}, []);
		return (
			<StorybookGameScene
				state={currentState.value}
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
		debug: false,
	},
	argTypes: {
		debug: { control: "boolean" },
	},
};
