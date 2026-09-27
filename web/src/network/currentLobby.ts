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
import {
	authorizationHeaders,
	currentUser,
} from "./currentUser";
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
				headers:
					authorizationHeaders(),
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
	if (
		!res.ok
	)
		throw new Error(
			body.error ??
				"Could not create lobby",
		);

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
	readyPlayers.value =
		newLobby.readyPlayers as Player[];
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

function mergeReadyPlayers(
	current: Player[],
	incoming: Player[],
) {
	const byId =
		new Map(
			current.map(
				(
					player,
				) => [
					player.id,
					player,
				],
			),
		);
	for (const player of incoming)
		byId.set(
			player.id,
			player,
		);
	return [
		...byId.values(),
	];
}

export async function joinLobby(
	id: string,
	toGame: () => void,
) {
	const url =
		new URL(
			`game-lobby/${encodeURIComponent(id)}/join-requests`,
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
				headers:
					authorizationHeaders(),
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
	if (
		!res.ok
	)
		throw new Error(
			body.error ??
				"Could not join lobby",
		);

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
	readyPlayers.value =
		newLobby.readyPlayers as Player[];
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
				headers:
					authorizationHeaders(),
				body: JSON.stringify(
					{
						player,
					},
				),
			},
		);
	if (
		!res.ok
	)
		throw new Error(
			(
				await res.json()
			)
				.error ??
				"Could not mark ready",
		);

	const body =
		await res.json();
	const updated =
		LobbySchema(
			body.lobby,
		);
	if (
		updated instanceof
		type.errors
	)
		throw updated;
	readyPlayers.value =
		mergeReadyPlayers(
			readyPlayers.value,
			updated.readyPlayers as Player[],
		);
	if (
		currentLobby
			.value
			?.id ===
		updated.id
	) {
		let lobby =
			currentLobby.value;
		for (const player of readyPlayers.value)
			lobby =
				lobby.upsertReadyPlayer(
					player,
				);
		currentLobby.value =
			lobby;
	}
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
			case "lobby-snapshot":
			case "player-joined": {
				logger.info(
					{
						receivedMessage,
					},
					"lobby updated",
				);
				const lobby =
					currentLobby.value;
				if (
					!lobby ||
					lobby.id !==
						receivedMessage
							.lobby
							.id
				)
					return;
				readyPlayers.value =
					mergeReadyPlayers(
						readyPlayers.value,
						receivedMessage
							.lobby
							.readyPlayers as Player[],
					);
				currentLobby.value =
					lobby.syncLobby(
						{
							...receivedMessage.lobby,
							readyPlayers:
								readyPlayers.value,
						},
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
					mergeReadyPlayers(
						readyPlayers.value,
						[
							receivedMessage.readyPlayer as Player,
						],
					);
				if (
					currentLobby.value
				)
					currentLobby.value =
						currentLobby.value.upsertReadyPlayer(
							receivedMessage.readyPlayer,
						);
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
					lobby.updatePlayer(
						player,
					);
				return;
			}
			case "player-connected": {
				const player =
					receivedMessage.player as PlayerAttendee;
				const lobby =
					currentLobby.value;
				if (
					lobby
				)
					currentLobby.value =
						lobby.updatePlayer(
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
