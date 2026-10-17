import {
	afterEach,
	expect,
	it,
} from "bun:test";
import { withEventMeta } from "./game-events/GameEvents";
import {
	finalizeWaveStats,
	gameStats,
	resetGameStats,
	updateStatsFromEvents,
	waveStats,
} from "./gameStats";
import {
	deltaTime,
	nowTime,
} from "./time";

afterEach(
	resetGameStats,
);
it("counts material value in wave and total statistics", () => {
	resetGameStats();
	updateStatsFromEvents(
		[
			1,
			5,
			25,
		].map(
			(
				value,
			) =>
				withEventMeta(
					{
						type: "materialCollected",
						materialId: `m${value}`,
						playerId:
							"player",
						value,
					},
					deltaTime(
						0,
					),
					nowTime(
						0,
					),
				),
		),
	);
	expect(
		waveStats
			.value
			.materialsCollected,
	).toBe(
		31,
	);
	finalizeWaveStats(
		1000,
	);
	expect(
		gameStats
			.value
			.materialsCollected,
	).toBe(
		31,
	);
});
