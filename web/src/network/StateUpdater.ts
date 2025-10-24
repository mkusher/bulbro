import type { Signal } from "@preact/signals";
import type { Logger } from "@/logger";
import type { WaveState } from "@/waveState";
import { updateState } from "@/waveState";
import type { User } from "./currentUser";
import type { WebsocketMessage } from "./InGameCommunicationChannel";
import type { ShotState } from "@/shot/ShotState";
import type { GameEvent } from "@/game-events/GameEvents";
import type { WaveProcess } from "@/WaveProcess";
import { deltaTime } from "@/time";

/**
 * Handles state updates for multiplayer games with event filtering based on host/guest role.
 * Maintains a copy of the last synced state and applies filtered events.
 */
export class StateUpdater {
	#logger: Logger;
	#currentState: Signal<WaveState>;
	#currentUser: Signal<User>;
	#waveProcess: WaveProcess;
	#lastSyncedState: WaveState;
	#isHost: boolean;
	#lastPositionVersion = 0;
	#lastStateVersion = 0;
	#lastUpdatedAt: number;
	#lastPositionUpdatedAt: number;

	constructor({
		logger,
		currentState,
		currentUser,
		waveProcess,
		isHost,
	}: {
		logger: Logger;
		currentState: Signal<WaveState>;
		currentUser: Signal<User>;
		waveProcess: WaveProcess;
		isHost: boolean;
	}) {
		this.#logger = logger;
		this.#currentState = currentState;
		this.#currentUser = currentUser;
		this.#waveProcess = waveProcess;
		this.#isHost = isHost;
		this.#lastSyncedState = currentState.value;
		this.#lastUpdatedAt = waveProcess.now();
		this.#lastPositionUpdatedAt = waveProcess.now();
	}

	/**
	 * Process incoming game socket messages and update local state with filtering.
	 */
	processMessage = (
		receivedMessage: typeof WebsocketMessage.infer,
		localEvents: GameEvent[] = [],
	) => {
		this.#logger.debug({ receivedMessage }, "Processing game message");

		switch (receivedMessage.type) {
			case "game-state-updated-by-guest":
			case "game-state-updated-by-host": {
				if (this.#lastStateVersion >= receivedMessage.version) {
					return;
				}
				// Version will be updated in handleStateUpdate after successful processing
				const now = this.#waveProcess.now();
				this.#logger.info(
					{
						version: receivedMessage.version,
						latestUpdateDelay: now - this.#lastUpdatedAt,
					},
					"Received a new remote state update",
				);
				this.#lastUpdatedAt = now;
			}
		}

		const shouldPositionBeUpdated =
			this.#lastPositionUpdatedAt < receivedMessage.sentAt;
		if (shouldPositionBeUpdated) {
			this.#lastPositionUpdatedAt = receivedMessage.sentAt;
		}

		switch (receivedMessage.type) {
			case "game-state-position-updated": {
				this.#handlePositionUpdate(receivedMessage, shouldPositionBeUpdated);
				return;
			}
			case "game-state-updated-by-host":
			case "game-state-updated-by-guest": {
				this.#handleStateUpdate(
					receivedMessage,
					shouldPositionBeUpdated,
					localEvents,
				);
				return;
			}
		}
	};

	#handlePositionUpdate(
		receivedMessage: Extract<
			typeof WebsocketMessage.infer,
			{ type: "game-state-position-updated" }
		>,
		shouldPositionBeUpdated: boolean,
	): void {
		if (
			this.#lastPositionVersion >= receivedMessage.version ||
			!shouldPositionBeUpdated
		)
			return;

		const affectedPlayerId = receivedMessage.playerId;
		const prevState = this.#currentState.value;
		const iam = this.#currentUser.value;

		if (affectedPlayerId === iam.id) {
			return;
		}

		this.#lastPositionVersion = receivedMessage.version;
		const localPlayer = prevState.players.find((p) => p.id === iam.id)!;
		const remotePlayer = prevState.players.find((p) => p.id !== iam.id)!;
		const now = this.#waveProcess.now();
		const { position, direction } = receivedMessage;

		this.#currentState.value = {
			...prevState,
			players: [
				localPlayer,
				remotePlayer.applyEvent({
					...remotePlayer.moveFromDirection(position, direction, now),
					deltaTime: deltaTime(16),
					occurredAt: now,
				}),
			],
		};
	}

	#handleStateUpdate(
		receivedMessage: Extract<
			typeof WebsocketMessage.infer,
			{ type: "game-state-updated-by-host" | "game-state-updated-by-guest" }
		>,
		shouldPositionBeUpdated: boolean,
		localEvents: GameEvent[],
	): void {
		if (this.#lastStateVersion >= receivedMessage.version) return;

		this.#lastStateVersion = receivedMessage.version;
		const remoteEvents = receivedMessage.events as GameEvent[];
		const filteredRemoteEvents = this.#filterEvents(remoteEvents);
		const filteredLocalEvents = this.#filterLocalEvents(localEvents);

		// Combine filtered local and filtered remote events, then sort by occurredAt field
		const allEvents = [...filteredLocalEvents, ...filteredRemoteEvents].sort(
			(a, b) => {
				const aNow = "occurredAt" in a ? a.occurredAt : 0;
				const bNow = "occurredAt" in b ? b.occurredAt : 0;
				return aNow - bNow;
			},
		);

		const prevState = this.#currentState.value;
		const receivedState = allEvents.reduce(updateState, prevState);
		const iam = this.#currentUser.value;
		const localPlayer = receivedState.players.find((p) => p.id === iam.id)!;
		let remotePlayer = receivedState.players.find((p) => p.id !== iam.id)!;

		if (!shouldPositionBeUpdated) {
			const previousRemotePlayer = prevState.players.find(
				(p) => p.id !== iam.id,
			)!;
			const moveEvent = remotePlayer.moveFromDirection(
				previousRemotePlayer.position,
				previousRemotePlayer.lastDirection,
				this.#waveProcess.now(),
			);
			remotePlayer = remotePlayer.applyEvent({
				...moveEvent,
				deltaTime: deltaTime(16),
				occurredAt: this.#waveProcess.now(),
			});
		}

		const isFromLocalPlayer = (shot: ShotState) =>
			shot.shooterType === "player" && shot.shooterId === localPlayer.id;
		const shots = [
			...prevState.shots.filter(isFromLocalPlayer),
			...receivedState.shots.filter((shot) => !isFromLocalPlayer(shot)),
		];

		const newState = {
			...prevState,
			round: receivedState.round,
			mapSize: receivedState.mapSize,
			objects: receivedState.objects,
			enemies: receivedState.enemies,
			shots,
			players: [localPlayer, remotePlayer],
		};

		this.#currentState.value = newState;
		this.#lastSyncedState = newState;
	}

	/**
	 * Filter remote events based on host/guest role and local player ID
	 */
	#filterEvents(events: GameEvent[]): GameEvent[] {
		const localPlayerId = this.#currentUser.value.id;

		return events.filter((event) => {
			if (this.#isHost) {
				return this.#filterRemoteEventsForHost(event, localPlayerId);
			} else {
				return this.#filterEventsForGuest(event, localPlayerId);
			}
		});
	}

	/**
	 * Filter local events based on host/guest role and local player ID
	 */
	#filterLocalEvents(events: GameEvent[]): GameEvent[] {
		const localPlayerId = this.#currentUser.value.id;

		return events.filter((event) => {
			if (this.#isHost) {
				return this.#filterLocalEventsForHost(event, localPlayerId);
			} else {
				return this.#filterLocalEventsForGuest(event, localPlayerId);
			}
		});
	}

	/**
	 * Filter local events for host - filters out:
	 * - Remote player moves, received hits, made shots, collected materials
	 */
	#filterLocalEventsForHost(event: GameEvent, localPlayerId: string): boolean {
		switch (event.type) {
			// Filter out remote player events
			case "bulbroMoved":
			case "bulbroReceivedHit":
			case "bulbroCollectedMaterial":
				return event.bulbroId === localPlayerId;

			// Filter out remote player shots
			case "shot":
				return (
					event.shot.shooterType !== "player" ||
					event.shot.shooterId === localPlayerId
				);

			// Keep all other events
			default:
				return true;
		}
	}

	/**
	 * Filter local events for guest - filters out:
	 * - Spawned and spawning enemies
	 * - Made remote player shots and enemy shots
	 * - Remote player shot moves, enemy shot moves
	 * - Materials dropped or collected by remote player
	 */
	#filterLocalEventsForGuest(event: GameEvent, localPlayerId: string): boolean {
		switch (event.type) {
			// Filter out enemy spawning events
			case "spawnEnemy":
			case "enemySpawningStarted":
				return false;

			// Filter out remote player shots and enemy shots
			case "shot":
				return (
					event.shot.shooterType === "player" &&
					event.shot.shooterId === localPlayerId
				);

			// Filter out shot movements (remote player and enemy shots)
			case "shotMoved":
			case "moveShot":
				return false; // Guest doesn't generate shot movements

			// Filter out material events by remote player
			case "materialCollected":
				return event.playerId === localPlayerId;
			case "materialSpawned":
				return false; // Guest doesn't spawn materials

			// Keep local player events and other system events
			default:
				return true;
		}
	}

	/**
	 * Host filters out:
	 * - Enemy events (spawns, attacks, moves) but keeps enemy hit events
	 * - Local player events (moves, attacks, hits, collected materials)
	 * Keeps:
	 * - Enemy received hit events
	 * - Remote player events
	 */
	#filterRemoteEventsForHost(event: GameEvent, localPlayerId: string): boolean {
		switch (event.type) {
			// Filter out enemy events except received hits
			case "spawnEnemy":
			case "enemySpawningStarted":
			case "enemyAttacked":
			case "enemyMoved":
				return false;

			// Keep enemy received hit events
			case "enemyReceivedHit":
			case "enemyDied":
				return true;

			// Filter out local player events
			case "bulbroMoved":
			case "bulbroAttacked":
			case "bulbroReceivedHit":
			case "bulbroCollectedMaterial":
			case "bulbroHealed":
			case "bulbroDied":
				return event.bulbroId !== localPlayerId;

			// Keep material and shot events from remote player
			case "materialCollected":
				return event.playerId !== localPlayerId;

			case "shot":
			case "shotMoved":
			case "shotExpired":
			case "moveShot":
				return true;

			// Keep other system events
			case "materialSpawned":
			case "materialMoved":
			case "tick":
			case "heal":
				return true;

			default:
				return true;
		}
	}

	/**
	 * Guest keeps all events (host is authoritative)
	 */
	#filterEventsForGuest(event: GameEvent, localPlayerId: string): boolean {
		// For guests, filter remote events and keep local player conflicts minimal
		return this.#filterRemoteEventsForGuest(event, localPlayerId);
	}

	/**
	 * Filter remote events for guest - includes:
	 * - All events about remote player
	 * - All enemy events
	 * - Materials if collected by remote player
	 * - Shots if made by remote player
	 */
	#filterRemoteEventsForGuest(
		event: GameEvent,
		localPlayerId: string,
	): boolean {
		switch (event.type) {
			// Remote player events - include all except local player
			case "bulbroMoved":
			case "bulbroAttacked":
			case "bulbroReceivedHit":
			case "bulbroCollectedMaterial":
			case "bulbroHealed":
			case "bulbroDied":
				return event.bulbroId !== localPlayerId;

			// Enemy events - include all
			case "spawnEnemy":
			case "enemySpawningStarted":
			case "enemyAttacked":
			case "enemyMoved":
			case "enemyReceivedHit":
			case "enemyDied":
				return true;

			// Material events - include if collected by remote player
			case "materialCollected":
				return event.playerId !== localPlayerId;
			case "materialSpawned":
				return true;

			// Shot events - include if made by remote player
			case "shot": {
				// Check if shot was made by local player
				return !(
					event.shot.shooterType === "player" &&
					event.shot.shooterId === localPlayerId
				);
			}
			case "shotMoved":
			case "shotExpired":
			case "moveShot":
				return true; // We don't have direct player info, so include all shot movements

			// System events - include all
			case "materialMoved":
			case "tick":
			case "heal":
				return true;

			default:
				return true;
		}
	}

	/**
	 * Get the last synced state
	 */
	getLastSyncedState(): WaveState {
		return this.#lastSyncedState;
	}

	/**
	 * Reset version tracking (useful for reconnections)
	 */
	reset(): void {
		this.#lastPositionVersion = 0;
		this.#lastStateVersion = 0;
		this.#lastUpdatedAt = this.#waveProcess.now();
		this.#lastPositionUpdatedAt = this.#waveProcess.now();
		this.#lastSyncedState = this.#currentState.value;
	}
}
