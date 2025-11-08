import {
	computed,
	signal,
} from "@preact/signals";
import { type } from "arktype";
import { currentGameProcess } from "@/currentGameProcess";
import {
	type Logger,
	logger,
} from "@/logger";
import type { Player } from "@/player";
import type { WaveState } from "@/waveState";
import { apiUrl } from "./clientConfig";
import { currentUser } from "./currentUser";
import { LobbyConnection } from "./LobbyConnection";
import {
	LobbySchema,
	type PlayerAttendee,
	type WebsocketMessage,
} from "./LobbySocketMessages";
import type { NetworkGameConnection } from "./NetworkGameConnection";
import { startNetworkGameAsGuest } from "./start-game";

export async function createLobby(
	toGame: () => void,
) {
	const url =
		new URL(
			"game-lobby",
			apiUrl,
		);
	const iam =
		currentUser.value;
	const res =
		await fetch(
			url,
			{
				method:
					"POST",
				body: JSON.stringify(
					{
						host: {
							id: iam.id,
							username:
								iam.username,
						},
					},
				),
			},
		);
	const body =
		await res.json();

	const newLobby =
		LobbySchema(
			body.lobby,
		);

	if (
		newLobby instanceof
		type.errors
	) {
		throw newLobby;
	}

	currentLobby.value =
		new LobbyConnection(
			logger,
			iam.id,
			newLobby,
			processLobbySocketMessage(
				logger,
				toGame,
			),
		);
}

export const currentLobby =
	signal<LobbyConnection | null>(
		null,
	);
export const isLocalPlayerHost =
	computed(
		() =>
			currentLobby
				.value
				?.hostId ===
			currentUser
				.value
				.id,
	);
export const currentNetworkGame =
	signal<NetworkGameConnection | null>(
		null,
	);
export const readyPlayers =
	signal<
		Player[]
	>(
		[],
	);

export async function joinLobby(
	id: string,
	toGame: () => void,
) {
	const url =
		new URL(
			`game-lobby/${id}/join-requests`,
			apiUrl,
		);
	const iam =
		currentUser.value;
	const res =
		await fetch(
			url,
			{
				method:
					"POST",
				body: JSON.stringify(
					{
						player:
							{
								id: iam.id,
								username:
									iam.username,
							},
					},
				),
			},
		);
	const body =
		await res.json();

	const newLobby =
		LobbySchema(
			body.lobby,
		);

	if (
		newLobby instanceof
		type.errors
	) {
		throw newLobby;
	}

	currentLobby.value =
		new LobbyConnection(
			logger,
			iam.id,
			newLobby,
			processLobbySocketMessage(
				logger,
				toGame,
			),
		);
}

export async function markAsReady(
	id: string,
	player: Player,
) {
	const url =
		new URL(
			`game-lobby/${id}/ready`,
			apiUrl,
		);

	const res =
		await fetch(
			url,
			{
				method:
					"POST",
				body: JSON.stringify(
					{
						player,
					},
				),
			},
		);
	await res.json();

	readyPlayers.value =
		[
			player,
			...readyPlayers.value,
		];
}

export function startGame() {
	const lobby =
		currentLobby.value;
	if (
		!lobby
	)
		return;
	const game =
		lobby.createGame(
			currentGameProcess.value,
		);
	currentNetworkGame.value =
		game;

	return game;
}

export function processLobbySocketMessage(
	logger: Logger,
	toGame: () => void,
) {
	return (
		receivedMessage: typeof WebsocketMessage.infer,
	) => {
		switch (
			receivedMessage.type
		) {
			case "connection": {
				logger.info(
					{
						receivedMessage,
					},
					"Websocket connection",
				);
				return;
			}
			case "player-joined": {
				logger.info(
					{
						receivedMessage,
					},
					"player joined",
				);
				const lobby =
					currentLobby.value;
				if (
					!lobby
				)
					return;
				currentLobby.value =
					lobby.addPlayers(
						receivedMessage
							.lobby
							.players,
					);
				return;
			}
			case "player-ready": {
				logger.info(
					{
						receivedMessage,
					},
					"player ready",
				);
				readyPlayers.value =
					[
						...readyPlayers.value,
						receivedMessage.readyPlayer as Player,
					];
				return;
			}
			case "player-disconnected": {
				logger.info(
					{
						receivedMessage,
					},
					"player disconnected",
				);
				const player =
					receivedMessage.player as PlayerAttendee;
				const lobby =
					currentLobby.value;
				if (
					!lobby
				)
					return;
				currentLobby.value =
					lobby.removePlayer(
						player,
					);
				return;
			}
			case "game-started": {
				logger.info(
					{
						receivedMessage,
					},
					"game started",
				);
				const state =
					receivedMessage.initialState as WaveState;
				startNetworkGameAsGuest(
					state,
					toGame,
				);
			}
		}
	};
}
