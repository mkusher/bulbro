import {
	currentGameProcess,
	isLoading,
	markAsLoading,
	markAsRunningWave,
	waveResult,
} from "@/currentGameProcess";
import type { Difficulty } from "@/game-formulas";
import {
	fromJSON,
	type WaveState,
	waveState,
} from "@/waveState";
import { apiUrl } from "./clientConfig";
import {
	currentNetworkGame,
	readyPlayers,
	startGame as startGameFromLobby,
} from "./currentLobby";
import { currentUser } from "./currentUser";
import { authorizationHeaders } from "./currentUser";
import { orderPlayersLocalFirst } from "./gameParticipants";

export async function startNetworkGameAsHost(
	selectedDifficulty: Difficulty,
	onStarted?: () => void,
) {
	const players =
		orderPlayersLocalFirst(
			readyPlayers.value,
			currentUser
				.value
				.id,
		);
	const game =
		startGameFromLobby();
	if (
		!game
	)
		throw new Error(
			"Game hasn't started",
		);
	const controls =
		game.createControls();

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
	let started = false;

	try {
		const {
			wavePromise,
			waveInitPromise,
		} =
			gameProcess.start(
				players,
				controls,
				selectedDifficulty,
			);
		await waveInitPromise;
		await sendGameStartedRequest(
			game.id,
			waveState.value,
		);
		started = true;
		onStarted?.();
		game.onStart(
			{
				waveInitPromise,
				wavePromise,
			},
		);
		markAsRunningWave();
		const result =
			await wavePromise;
		waveResult.value =
			result;
	} catch (error) {
		if (
			!started
		) {
			await gameProcess.waveProcess
				?.stop(
					"fail",
				)
				.catch(
					() => {},
				);
			currentNetworkGame.value =
				null;
		}
		throw error;
	} finally {
		isLoading.value = false;
	}
}

export async function sendGameStartedRequest(
	gameId: string,
	state: WaveState,
) {
	const url =
		new URL(
			`game/${gameId}/start`,
			apiUrl,
		);
	const res =
		await fetch(
			url,
			{
				method:
					"POST",
				headers:
					authorizationHeaders(),
				body: JSON.stringify(
					{
						state,
					},
				),
			},
		);

	if (
		!res.ok
	) {
		const body =
			await res
				.json()
				.catch(
					() => ({}),
				);
		throw new Error(
			body.error ??
				`Game start failed (${res.status})`,
		);
	}
}

export async function startNetworkGameAsGuest(
	initialState: WaveState,
	toGame: () => void,
) {
	const game =
		startGameFromLobby();
	if (
		!game
	) {
		throw new Error(
			"Game hasn't started",
		);
	}
	const iam =
		currentUser.value;
	const localPlayer =
		initialState.players.find(
			(
				p,
			) =>
				p.id ===
				iam.id,
		)!;
	const remotePlayer =
		initialState.players.find(
			(
				p,
			) =>
				p.id !==
				iam.id,
		)!;
	fromJSON(
		{
			...initialState,
			players:
				[
					localPlayer,
					remotePlayer,
				],
		},
	);
	try {
		const {
			wavePromise,
			waveInitPromise,
		} =
			game.startRemote();
		await waveInitPromise;
		toGame();
		game.onStart(
			{
				waveInitPromise,
				wavePromise,
			},
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
