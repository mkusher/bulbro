import { computed, signal } from "@preact/signals";
import { apiUrl } from "./clientConfig";
import { type } from "arktype";
import type { Player } from "@/player";
import { currentUser } from "./currentUser";
import { logger, type Logger } from "@/logger";
import {
	LobbySchema,
	PlayerAttendee,
	WebsocketMessage,
} from "./LobbySocketMessages";
import { LobbyConnection } from "./LobbyConnection";
import { type NetworkGameConnection } from "./NetworkGameConnection";
import type { WebsocketMessage as GameWebsocketMessage } from "./InGameCommunicationChannel";
import { currentGameProcess } from "@/currentGameProcess";
import { currentState, fromJSON, type CurrentState } from "@/currentState";
import { startNetworkGameAsGuest } from "./start-game";
import type { ShotState } from "@/shot/ShotState";

export async function createLobby(toGame: () => void) {
	const url = new URL("game-lobby", apiUrl);
	const iam = currentUser.value;
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			host: {
				id: iam.id,
				username: iam.username,
			},
		}),
	});
	const body = await res.json();

	const newLobby = LobbySchema(body.lobby);

	if (newLobby instanceof type.errors) {
		throw newLobby;
	}

	currentLobby.value = new LobbyConnection(
		logger,
		iam.id,
		newLobby,
		processLobbySocketMessage(logger, toGame),
	);
}

export const currentLobby = signal<LobbyConnection | null>(null);
export const isLocalPlayerHost = computed(
	() => currentLobby.value?.hostId === currentUser.value.id,
);
export const currentNetworkGame = signal<NetworkGameConnection | null>(null);
export const readyPlayers = signal<Player[]>([]);

export async function joinLobby(id: string, toGame: () => void) {
	const url = new URL(`game-lobby/${id}/join-requests`, apiUrl);
	const iam = currentUser.value;
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			player: {
				id: iam.id,
				username: iam.username,
			},
		}),
	});
	const body = await res.json();

	const newLobby = LobbySchema(body.lobby);

	if (newLobby instanceof type.errors) {
		throw newLobby;
	}

	currentLobby.value = new LobbyConnection(
		logger,
		iam.id,
		newLobby,
		processLobbySocketMessage(logger, toGame),
	);
}

export async function markAsReady(id: string, player: Player) {
	const url = new URL(`game-lobby/${id}/ready`, apiUrl);

	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			player,
		}),
	});
	await res.json();

	readyPlayers.value = [player, ...readyPlayers.value];
}

export function startGame() {
	const lobby = currentLobby.value;
	if (!lobby) return;
	const game = lobby.createGame(
		currentGameProcess.value,
		processGameSocketMessage(logger),
	);
	currentNetworkGame.value = game;

	return game;
}

export function processLobbySocketMessage(logger: Logger, toGame: () => void) {
	return (receivedMessage: typeof WebsocketMessage.infer) => {
		switch (receivedMessage.type) {
			case "connection": {
				logger.info({ receivedMessage }, "Websocket connection");
				return;
			}
			case "player-joined": {
				logger.info({ receivedMessage }, "player joined");
				const lobby = currentLobby.value;
				if (!lobby) return;
				currentLobby.value = lobby.addPlayers(receivedMessage.lobby.players);
				return;
			}
			case "player-ready": {
				logger.info({ receivedMessage }, "player ready");
				readyPlayers.value = [
					...readyPlayers.value,
					receivedMessage.readyPlayer as Player,
				];
				return;
			}
			case "player-disconnected": {
				logger.info({ receivedMessage }, "player disconnected");
				const player = receivedMessage.player as PlayerAttendee;
				const lobby = currentLobby.value;
				if (!lobby) return;
				currentLobby.value = lobby.removePlayer(player);
				return;
			}
			case "game-started": {
				logger.info({ receivedMessage }, "game started");
				const state = receivedMessage.initialState as CurrentState;
				startNetworkGameAsGuest(state, toGame);
			}
		}
	};
}

export function processGameSocketMessage(logger: Logger) {
	let lastPositionVersion = 0;
	let lastStateVersion = 0;
	let lastUpdatedAt = Date.now();
	let lastPositionUpdatedAt = Date.now();
	return (receivedMessage: typeof GameWebsocketMessage.infer) => {
		logger.debug({ receivedMessage }, "In game message received");
		switch (receivedMessage.type) {
			case "game-state-updated-by-guest":
			case "game-state-updated-by-host": {
				if (lastStateVersion >= receivedMessage.version) return;
				lastStateVersion = receivedMessage.version;
				const now = Date.now();
				logger.info(
					{
						version: lastStateVersion,
						latestUpdateDelay: now - lastUpdatedAt,
					},
					"Received a new remote state update",
				);
				lastUpdatedAt = now;
			}
		}

		const shouldPositionBeUpdated =
			lastPositionUpdatedAt < receivedMessage.sentAt;
		if (shouldPositionBeUpdated) {
			lastPositionUpdatedAt = receivedMessage.sentAt;
		}

		switch (receivedMessage.type) {
			case "game-state-position-updated": {
				if (
					lastPositionVersion >= receivedMessage.version ||
					!shouldPositionBeUpdated
				)
					return;
				const affectedPlayerId = receivedMessage.playerId;
				const prevState = currentState.value;
				const iam = currentUser.value;
				if (affectedPlayerId === iam.id) {
					return;
				}
				lastPositionVersion = receivedMessage.version;
				const localPlayer = prevState.players.find((p) => p.id === iam.id)!;
				const remotePlayer = prevState.players.find((p) => p.id !== iam.id)!;
				const now = Date.now();
				const { position, direction } = receivedMessage;
				fromJSON({
					...prevState,
					players: [
						localPlayer,
						remotePlayer.moveFromDirection(position, direction, now),
					],
				});
				return;
			}
			case "game-state-updated-by-host":
			case "game-state-updated-by-guest": {
				if (lastStateVersion >= receivedMessage.version) return;
				lastStateVersion = receivedMessage.version;
				const receivedState = receivedMessage.state as CurrentState;
				const prevState = currentState.value;
				const iam = currentUser.value;
				const localPlayer = prevState.players.find((p) => p.id === iam.id)!;
				let remotePlayer = receivedState.players.find((p) => p.id !== iam.id)!;
				if (!shouldPositionBeUpdated) {
					const previousRemotePlayer = prevState.players.find(
						(p) => p.id !== iam.id,
					)!;
					remotePlayer = remotePlayer.moveFromDirection(
						previousRemotePlayer.position,
						previousRemotePlayer.lastDirection,
						Date.now(),
					);
				}

				const isFromLocalPlayer = (shot: ShotState) =>
					shot.shooterType === "player" && shot.shooterId === localPlayer.id;
				const shots = [
					...prevState.shots.filter(isFromLocalPlayer),
					...receivedState.shots.filter((shot) => !isFromLocalPlayer(shot)),
				];
				fromJSON({
					...prevState,
					round: receivedState.round,
					mapSize: receivedState.mapSize,
					objects: receivedState.objects,
					enemies: receivedState.enemies,
					shots,
					players: [localPlayer, remotePlayer],
				});
				return;
			}
		}
	};
}
