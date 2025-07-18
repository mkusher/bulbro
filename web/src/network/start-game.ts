import type { Difficulty } from "@/game-formulas";
import { readyPlayers } from "./currentLobby";
import { startGame as startGameFromLobby } from "./currentLobby";
import { apiUrl } from "./clientConfig";
import { currentState, fromJSON, type CurrentState } from "@/currentState";
import {
	currentGameProcess,
	isLoading,
	markAsLoading,
	markAsRunningWave,
	waveResult,
} from "@/currentGameProcess";
import { currentUser } from "./currentUser";

export async function startNetworkGameAsHost(
	selectedDifficulty: Difficulty,
	selectedDuration: number,
) {
	const game = startGameFromLobby();
	if (!game) {
		throw new Error("Game hasn't started");
	}
	const players = readyPlayers.value;
	const controls = game.createControls();

	const gameProcess = currentGameProcess.value;
	if (!gameProcess) {
		throw new Error("No game process");
	}

	markAsLoading();

	try {
		const { wavePromise, waveInitPromise } = gameProcess.start(
			players,
			controls,
			selectedDifficulty,
			selectedDuration,
		);
		await waveInitPromise;
		await sendGameStartedRequest(game.id, currentState.value);
		game.onStart({ waveInitPromise, wavePromise });
		markAsRunningWave();
		const result = await wavePromise;
		waveResult.value = result;
	} finally {
		isLoading.value = false;
	}
}

export async function sendGameStartedRequest(
	gameId: string,
	state: CurrentState,
) {
	const url = new URL(`game/${gameId}/start`, apiUrl);
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			state,
		}),
	});

	return res.ok;
}

export async function startNetworkGameAsNonHost(initialState: CurrentState) {
	const game = startGameFromLobby();
	if (!game) {
		throw new Error("Game hasn't started");
	}
	const iam = currentUser.value;
	fromJSON(initialState);
	const state = currentState.value;
	const localPlayer = state.players.find((p) => p.id === iam.id)!;
	const remotePlayer = state.players.find((p) => p.id !== iam.id)!;
	currentState.value = {
		...state,
		players: [localPlayer, remotePlayer],
	};
	try {
		const { wavePromise, waveInitPromise } = game.startRemote();
		await waveInitPromise;
		game.onStart({ waveInitPromise, wavePromise });
		markAsRunningWave();
		const result = await wavePromise;
		waveResult.value = result;
	} finally {
		isLoading.value = false;
	}
}
