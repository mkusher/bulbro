import { signal } from "@preact/signals";
import type { PlayerControl } from "./controls";
import { GameProcess } from "./GameProcess";
import type { Difficulty } from "./game-formulas";
import type { Player } from "./player";
import type { WaveState } from "./waveState";

export const currentGameProcess =
	signal<GameProcess>(
		new GameProcess(
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
	duration: number,
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
	try {
		const {
			wavePromise,
			waveInitPromise,
		} =
			gameProcess.start(
				players,
				playerControls,
				difficulty,
				duration,
			);
		await waveInitPromise;
		markAsRunningWave();
		const result =
			await wavePromise;
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
		waveResult.value =
			result;
	} finally {
		isLoading.value = false;
	}
}
