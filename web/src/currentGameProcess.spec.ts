import {
	afterEach,
	expect,
	it,
	mock,
} from "bun:test";
import { requireDefined } from "@/requireDefined";
import { BulbroState } from "./bulbro/BulbroState";
import { wellRoundedBulbro } from "./characters-definitions";
import type { PlayerControl } from "./controls";
import {
	currentGameProcess,
	disableSinglePlayerSaving,
	isLoading,
	isRound,
	markAsLoading,
	resumeLocalGame,
	startLocalGame,
	startWave,
	waveResult,
	waveSummaryDismissed,
} from "./currentGameProcess";
import type {
	GameProcess,
	WaveProcess,
} from "./GameProcess";
import {
	gameStats,
	resetGameStats,
	waveStats,
} from "./gameStats";
import {
	loadSinglePlayerGame,
	saveSinglePlayerGame,
} from "./singlePlayerSave";
import {
	deltaTime,
	nowTime,
} from "./time";
import {
	createInitialState,
	nextWave,
	waveState,
} from "./waveState";

const originalProcess =
	currentGameProcess.value;
afterEach(
	() => {
		disableSinglePlayerSaving();
		currentGameProcess.value =
			originalProcess;
		markAsLoading();
		localStorage.removeItem(
			"singlePlayerGame",
		);
		resetGameStats();
	},
);
function initial() {
	return createInitialState(
		[
			{
				id: "p1",
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
	);
}
function fakeProcess() {
	const completed =
		Promise.withResolvers<
			| "win"
			| "fail"
		>();
	const promises =
		{
			waveInitPromise:
				Promise.resolve(
					{} as WaveProcess,
				),
			wavePromise:
				completed.promise,
		};
	const process =
		{
			start:
				mock(
					() => {
						waveState.value =
							initial();
						return promises;
					},
				),
			startWave:
				mock(
					() =>
						promises,
				),
			startNextWave:
				mock(
					async (
						state,
						_controls?: PlayerControl[],
					) => {
						waveState.value =
							nextWave(
								state,
								{
									type: "tick",
									occurredAt:
										nowTime(
											0,
										),
									deltaTime:
										deltaTime(
											0,
										),
								},
							);
						return promises;
					},
				),
			setEventFilter() {},
			gameCanvas:
				undefined,
			waveProcess:
				undefined,
		} satisfies GameProcess;
	currentGameProcess.value =
		process;
	return {
		process,
		completed,
	};
}
it("saves a local wave, persists shop edits, and removes a failed run", async () => {
	const {
		completed,
	} =
		fakeProcess();
	const running =
		startLocalGame(
			[
				{
					id: "p1",
					bulbro:
						wellRoundedBulbro,
				},
			],
			[],
			2,
		);
	expect(
		requireDefined(
			loadSinglePlayerGame(),
		)
			.phase,
	).toBe(
		"wave",
	);
	await Promise.resolve();
	completed.resolve(
		"win",
	);
	await running;
	expect(
		requireDefined(
			loadSinglePlayerGame(),
		)
			.phase,
	).toBe(
		"shop",
	);
	const player =
		requireDefined(
			waveState
				.value
				.players[0],
		);
	waveState.value =
		{
			...waveState.value,
			players:
				[
					new BulbroState(
						{
							...player.toJSON(),
							materialsAvailable: 50,
						},
					).spendMaterials(
						10,
					),
				],
		};
	expect(
		requireDefined(
			requireDefined(
				loadSinglePlayerGame(),
			)
				.state
				.players[0],
		).toJSON(),
	).toEqual(
		requireDefined(
			waveState
				.value
				.players[0],
		).toJSON(),
	);
	waveResult.value =
		"fail";
	expect(
		loadSinglePlayerGame(),
	).toBeUndefined();
});
it("resumes an interrupted wave with fresh tracking and restored totals", async () => {
	resetGameStats();
	saveSinglePlayerGame(
		initial(),
		{
			...gameStats.value,
			wavesCompleted: 7,
		},
		"wave",
	);
	const {
		process,
		completed,
	} =
		fakeProcess();
	const running =
		resumeLocalGame();
	await Promise.resolve();
	expect(
		process.startWave,
	).toHaveBeenCalledTimes(
		1,
	);
	expect(
		process.start,
	).not.toHaveBeenCalled();
	expect(
		isLoading.value,
	).toBe(
		false,
	);
	expect(
		isRound.value,
	).toBe(
		true,
	);
	expect(
		waveStats
			.value
			.wave,
	).toBe(
		8,
	);
	expect(
		gameStats
			.value
			.wavesCompleted,
	).toBe(
		7,
	);
	expect(
		waveState
			.value
			.round
			.startedAt,
	).toBeGreaterThan(
		Date.now() -
			1000,
	);
	completed.resolve(
		"fail",
	);
	await running;
	expect(
		loadSinglePlayerGame(),
	).toBeUndefined();
});
it("keeps wave-start player state and totals when initialization advances gameplay", async () => {
	saveSinglePlayerGame(
		initial(),
		{
			...gameStats.value,
			wavesCompleted: 8,
		},
		"shop",
	);
	const {
		process,
		completed,
	} =
		fakeProcess();
	await resumeLocalGame();
	const checkpoint =
		nextWave(
			waveState.value,
			{
				type: "tick",
				occurredAt:
					nowTime(
						0,
					),
				deltaTime:
					deltaTime(
						0,
					),
			},
		);
	process.startNextWave.mockImplementation(
		async () => {
			waveState.value =
				{
					...checkpoint,
					players:
						[
							new BulbroState(
								{
									...requireDefined(
										checkpoint
											.players[0],
									).toJSON(),
									healthPoints: 1,
									materialsAvailable: 999,
									totalExperience: 999,
								},
							),
						],
				};
			gameStats.value =
				{
					...gameStats.value,
					damageTaken: 99,
				};
			return {
				initialState:
					checkpoint,
				waveInitPromise:
					Promise.resolve(
						{} as WaveProcess,
					),
				wavePromise:
					completed.promise,
			};
		},
	);
	const running =
		startWave(
			waveState.value,
		);
	await Promise.resolve();
	const save =
		requireDefined(
			loadSinglePlayerGame(),
		);
	expect(
		requireDefined(
			save
				.state
				.players[0],
		).toJSON(),
	).toEqual(
		requireDefined(
			checkpoint
				.players[0],
		).toJSON(),
	);
	expect(
		save
			.stats
			.damageTaken,
	).toBe(
		0,
	);
	waveState.value =
		{
			...waveState.value,
			players:
				[
					new BulbroState(
						{
							...requireDefined(
								waveState
									.value
									.players[0],
							).toJSON(),
							materialsAvailable: 1000,
						},
					),
				],
		};
	expect(
		requireDefined(
			requireDefined(
				loadSinglePlayerGame(),
			)
				.state
				.players[0],
		).toJSON(),
	).toEqual(
		requireDefined(
			checkpoint
				.players[0],
		).toJSON(),
	);
	completed.resolve(
		"fail",
	);
	await running;
});

it("restores the shop and starts the next wave with recreated controls", async () => {
	resetGameStats();
	saveSinglePlayerGame(
		initial(),
		{
			...gameStats.value,
			wavesCompleted: 8,
		},
		"shop",
	);
	const {
		process,
		completed,
	} =
		fakeProcess();
	await resumeLocalGame();
	expect(
		process.startWave,
	).not.toHaveBeenCalled();
	expect(
		waveResult.value,
	).toBe(
		"win",
	);
	expect(
		waveSummaryDismissed.value,
	).toBe(
		true,
	);
	const running =
		startWave(
			waveState.value,
		);
	await Promise.resolve();
	expect(
		requireDefined(
			process
				.startNextWave
				.mock
				.calls[0],
		)[1],
	).toHaveLength(
		1,
	);
	expect(
		requireDefined(
			loadSinglePlayerGame(),
		)
			.phase,
	).toBe(
		"wave",
	);
	expect(
		requireDefined(
			loadSinglePlayerGame(),
		)
			.state
			.round
			.wave,
	).toBe(
		9,
	);
	completed.resolve(
		"fail",
	);
	await running;
});
