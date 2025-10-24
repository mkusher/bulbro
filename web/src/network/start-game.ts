import type { Difficulty } from "@/game-formulas";
import { readyPlayers } from "./currentLobby";
import { startGame as startGameFromLobby } from "./currentLobby";
import { apiUrl } from "./clientConfig";
import { waveState, fromJSON, type WaveState } from "@/waveState";
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
		await sendGameStartedRequest(game.id, waveState.value);
		game.onStart({ waveInitPromise, wavePromise });
		markAsRunningWave();
		const result = await wavePromise;
		waveResult.value = result;
	} finally {
		isLoading.value = false;
	}
}

export async function sendGameStartedRequest(gameId: string, state: WaveState) {
	const url = new URL(`game/${gameId}/start`, apiUrl);
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			state,
		}),
	});

	return res.ok;
}

export async function startNetworkGameAsGuest(
	initialState: WaveState,
	toGame: () => void,
) {
	const game = startGameFromLobby();
	if (!game) {
		throw new Error("Game hasn't started");
	}
	const iam = currentUser.value;
	const localPlayer = initialState.players.find((p) => p.id === iam.id)!;
	const remotePlayer = initialState.players.find((p) => p.id !== iam.id)!;
	fromJSON({
		...initialState,
		players: [localPlayer, remotePlayer],
	});
	try {
		const { wavePromise, waveInitPromise } = game.startRemote();
		await waveInitPromise;
		toGame();
		game.onStart({ waveInitPromise, wavePromise });
		markAsRunningWave();
		const result = await wavePromise;
		waveResult.value = result;
	} finally {
		isLoading.value = false;
	}
}
