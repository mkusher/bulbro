import { DarkOracleSprite } from "@/bulbro/sprites/DarkOracleSprite";
import { StorybookScene } from "./StorybookScene";
import { spawnBulbro } from "@/bulbro/BulbroState";
import { wellRoundedBulbro } from "@/characters-definitions";
import { signal } from "@preact/signals";

const mockOracleState = signal(
	spawnBulbro(
		"dark oracle",
		"dark oracle",
		{ x: 0, y: 0 },
		0,
		0,
		wellRoundedBulbro,
	),
);
const sprite = new DarkOracleSprite(false);

export default {
	title: "Bulbros/Dark Oracle",
	component: StorybookScene,
};

export const Idle = () => (
	<StorybookScene sprite={sprite} state={mockOracleState.value} />
);

export const WithMovement = () => (
	<StorybookScene
		sprite={sprite}
		state={mockOracleState.value}
		tick={() => {
			mockOracleState.value = mockOracleState.value.move(
				mockOracleState.value.position,
				Date.now(),
			);
		}}
	/>
);
