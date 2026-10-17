import {
	beforeEach,
	expect,
	it,
} from "bun:test";
import { BulbroState } from "./bulbro/BulbroState";
import { wellRoundedBulbro } from "./characters-definitions";
import {
	gameStats,
	resetGameStats,
} from "./gameStats";
import {
	clearSinglePlayerGame,
	loadSinglePlayerGame,
	saveSinglePlayerGame,
} from "./singlePlayerSave";
import { createInitialState } from "./waveState";

beforeEach(
	() => {
		localStorage.clear();
		resetGameStats();
	},
);
function state() {
	return createInitialState(
		[
			{
				id: "saved-player",
				bulbro:
					wellRoundedBulbro,
			},
		],
		{
			width: 6000,
			height: 4500,
		},
		2,
		8,
		4,
		25,
	);
}
it("restores a wave checkpoint with a functional player and the full build", () => {
	const original =
		state();
	saveSinglePlayerGame(
		original,
		{
			...gameStats.value,
			wavesCompleted: 7,
		},
		"wave",
	);
	const saved =
		loadSinglePlayerGame()!;
	expect(
		saved.phase,
	).toBe(
		"wave",
	);
	expect(
		saved
			.state
			.round
			.wave,
	).toBe(
		8,
	);
	expect(
		saved
			.state
			.round
			.difficulty,
	).toBe(
		2,
	);
	expect(
		saved
			.stats
			.wavesCompleted,
	).toBe(
		7,
	);
	expect(
		saved
			.state
			.players[0],
	).toBeInstanceOf(
		BulbroState,
	);
	expect(
		saved.state.players[0]!.toJSON(),
	).toEqual(
		original.players[0]!.toJSON(),
	);
	expect(
		saved.state.players[0]!.spendMaterials(
			1,
		),
	).toBeInstanceOf(
		BulbroState,
	);
});
it("updates shop progress and clears a finished run", () => {
	const original =
		state();
	saveSinglePlayerGame(
		original,
		gameStats.value,
		"wave",
	);
	const player =
		original
			.players[0]!;
	const rich =
		new BulbroState(
			{
				...player.toJSON(),
				materialsAvailable: 100,
				items:
					[
						"coffee",
					],
				rerollCount: 2,
			},
		);
	saveSinglePlayerGame(
		{
			...original,
			players:
				[
					rich.spendMaterials(
						25,
					),
				],
		},
		gameStats.value,
		"shop",
	);
	const saved =
		loadSinglePlayerGame()!;
	expect(
		saved.phase,
	).toBe(
		"shop",
	);
	expect(
		saved
			.state
			.players[0]!
			.materialsAvailable,
	).toBe(
		75,
	);
	expect(
		saved
			.state
			.players[0]!
			.items,
	).toEqual(
		[
			"coffee",
		],
	);
	expect(
		saved
			.state
			.players[0]!
			.rerollCount,
	).toBe(
		2,
	);
	clearSinglePlayerGame();
	expect(
		loadSinglePlayerGame(),
	).toBeUndefined();
});
it("keeps the single-player save when asked to save co-op", () => {
	const original =
		state();
	saveSinglePlayerGame(
		original,
		gameStats.value,
		"wave",
	);
	saveSinglePlayerGame(
		{
			...original,
			players:
				[
					...original.players,
					original
						.players[0]!,
				],
		},
		gameStats.value,
		"shop",
	);
	expect(
		loadSinglePlayerGame()!
			.phase,
	).toBe(
		"wave",
	);
});
it("ignores corrupt, incompatible, and incomplete saves", () => {
	for (const value of [
		"oops",
		"null",
		"{}",
		'{"version":2}',
		'{"version":1,"phase":"wave","state":{}}',
	]) {
		localStorage.setItem(
			"singlePlayerGame",
			value,
		);
		expect(
			loadSinglePlayerGame(),
		).toBeUndefined();
	}
});
it("continues when browser storage is blocked", () => {
	const storage =
		{
			getItem() {
				throw new Error(
					"blocked",
				);
			},
			setItem() {
				throw new Error(
					"blocked",
				);
			},
			removeItem() {
				throw new Error(
					"blocked",
				);
			},
		} as unknown as Storage;
	expect(
		() =>
			saveSinglePlayerGame(
				state(),
				gameStats.value,
				"wave",
				storage,
			),
	).not.toThrow();
	expect(
		loadSinglePlayerGame(
			storage,
		),
	).toBeUndefined();
	expect(
		() =>
			clearSinglePlayerGame(
				storage,
			),
	).not.toThrow();
});
