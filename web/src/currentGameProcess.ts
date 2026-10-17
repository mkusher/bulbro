import {
	effect,
	signal,
} from "@preact/signals";
import type { PlayerControl } from "./controls";
import { createMainControls } from "./controls";
import type { GameProcess } from "./GameProcess";
import { BaseGameProcess } from "./GameProcess/BaseGameProcess";
import type { Difficulty } from "./game-formulas";
import {
	finalizeWaveStats,
	gameStats,
	resetGameStats,
	startWaveTracking,
} from "./gameStats";
import type { Player } from "./player";
import {
	clearSinglePlayerGame,
	loadSinglePlayerGame,
	saveSinglePlayerGame,
} from "./singlePlayerSave";
import {
	getRoundElapsedTime,
	type WaveState,
	waveState,
} from "./waveState";

const savingSinglePlayer =
	signal(
		false,
	);
let localControls: PlayerControl[] =
	[];

export function disableSinglePlayerSaving() {
	savingSinglePlayer.value = false;
}

export const currentGameProcess =
	signal<GameProcess>(
		new BaseGameProcess(
			localStorage.getItem(
				"__enable_debug",
			) ===
				"1",
		),
	);
export const currentGameCanvas =
	signal<
		| HTMLCanvasElement
		| undefined
	>(
		undefined,
	);

export const isLoading =
	signal<boolean>(
		false,
	);

export const isRound =
	signal<boolean>(
		false,
	);

export const waveResult =
	signal<
		| "win"
		| "fail"
		| undefined
	>(
		undefined,
	);

/**
 * Whether the player has dismissed the end-of-wave summary and moved on to the shop.
 */
export const waveSummaryDismissed =
	signal<boolean>(
		false,
	);

effect(
	() => {
		if (
			!savingSinglePlayer.value ||
			isLoading.value
		)
			return;
		if (
			waveResult.value ===
			"fail"
		) {
			clearSinglePlayerGame();
			savingSinglePlayer.value = false;
		} else if (
			waveResult.value ===
			"win"
		)
			saveSinglePlayerGame(
				waveState.value,
				gameStats.value,
				"shop",
			);
	},
);

export async function resumeLocalGame() {
	const save =
		loadSinglePlayerGame();
	if (
		!save
	)
		return;
	markAsLoading();
	savingSinglePlayer.value = true;
	localControls =
		[
			createMainControls(),
		];
	resetGameStats();
	gameStats.value =
		save.stats;
	waveState.value =
		{
			...save.state,
			round:
				{
					...save
						.state
						.round,
					startedAt:
						Date.now(),
					endedAt:
						undefined,
				},
		};
	if (
		save.phase ===
		"shop"
	) {
		markAsRunningWave();
		waveSummaryDismissed.value = true;
		waveResult.value =
			"win";
		return;
	}
	startWaveTracking(
		save
			.state
			.round
			.wave,
	);
	try {
		const {
			waveInitPromise,
			wavePromise,
		} =
			currentGameProcess.value.startWave(
				localControls,
			);
		await waveInitPromise;
		markAsRunningWave();
		const result =
			await wavePromise;
		finalizeWaveStats(
			getRoundElapsedTime(
				waveState
					.value
					.round,
			),
		);
		waveResult.value =
			result;
	} finally {
		isLoading.value = false;
	}
}

export function dismissWaveSummary() {
	waveSummaryDismissed.value = true;
}

export function markAsLoading() {
	isLoading.value = true;
	isRound.value = false;
	waveResult.value =
		undefined;
	waveSummaryDismissed.value = false;
}

export function markAsRunningWave() {
	isLoading.value = false;
	isRound.value = true;
	waveResult.value =
		undefined;
	waveSummaryDismissed.value = false;
}

export async function startLocalGame(
	players: Player[],
	playerControls: PlayerControl[],
	difficulty: Difficulty,
) {
	const gameProcess =
		currentGameProcess.value;
	if (
		!gameProcess
	) {
		throw new Error(
			"No game process",
		);
	}
	markAsLoading();
	localControls =
		playerControls;
	savingSinglePlayer.value =
		players.length ===
		1;
	resetGameStats();
	startWaveTracking(
		1,
	);
	try {
		const {
			wavePromise,
			waveInitPromise,
		} =
			gameProcess.start(
				players,
				playerControls,
				difficulty,
			);
		if (
			savingSinglePlayer.value
		)
			saveSinglePlayerGame(
				waveState.value,
				gameStats.value,
				"wave",
			);
		await waveInitPromise;
		markAsRunningWave();
		const result =
			await wavePromise;
		const state =
			waveState.value;
		const survivalTimeMs =
			getRoundElapsedTime(
				state.round,
			);
		finalizeWaveStats(
			survivalTimeMs,
		);
		waveResult.value =
			result;
	} finally {
		isLoading.value = false;
	}
}

export async function startWave(
	state: WaveState,
) {
	markAsLoading();
	const gameProcess =
		currentGameProcess.value;
	if (
		!gameProcess
	) {
		throw new Error(
			"No game process",
		);
	}
	const nextWaveNumber =
		state
			.round
			.wave +
		1;
	startWaveTracking(
		nextWaveNumber,
	);
	try {
		const {
			wavePromise,
		} =
			await gameProcess.startNextWave(
				state,
				localControls,
			);
		if (
			savingSinglePlayer.value
		)
			saveSinglePlayerGame(
				waveState.value,
				gameStats.value,
				"wave",
			);
		markAsRunningWave();
		const result =
			await wavePromise;
		const currentState =
			waveState.value;
		const survivalTimeMs =
			getRoundElapsedTime(
				currentState.round,
			);
		finalizeWaveStats(
			survivalTimeMs,
		);
		waveResult.value =
			result;
	} finally {
		isLoading.value = false;
	}
}
