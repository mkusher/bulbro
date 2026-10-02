import { signal } from "@preact/signals";
import type { PlayerControl } from "./controls";
import type { GameProcess } from "./GameProcess";
import { BaseGameProcess } from "./GameProcess/BaseGameProcess";
import type { Difficulty } from "./game-formulas";
import {
	finalizeWaveStats,
	resetGameStats,
	startWaveTracking,
} from "./gameStats";
import type { Player } from "./player";
import {
	getRoundElapsedTime,
	type WaveState,
	waveState,
} from "./waveState";

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

export function markAsLoading() {
	isLoading.value = true;
	isRound.value = false;
	waveResult.value =
		undefined;
}

export function markAsRunningWave() {
	isLoading.value = false;
	isRound.value = true;
	waveResult.value =
		undefined;
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
