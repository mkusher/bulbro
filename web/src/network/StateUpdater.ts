import type { Signal } from "@preact/signals";
import {
	EnemyState,
	type EnemyStateProps,
} from "@/enemy/EnemyState";
import type { WaveProcess } from "@/GameProcess";
import type { GameEvent } from "@/game-events/GameEvents";
import type { Logger } from "@/logger";
import { ShotState } from "@/shot/ShotState";
import { deltaTime } from "@/time";
import {
	updateState,
	type WaveState,
} from "@/waveState";
import type { User } from "./currentUser";
import type { WebsocketMessage } from "./InGameCommunicationChannel";

function hydrateEvent(
	event: GameEvent,
): GameEvent {
	if (
		event.type ===
		"spawnEnemy"
	) {
		return {
			...event,
			enemy:
				event.enemy instanceof
				EnemyState
					? event.enemy
					: new EnemyState(
							{
								...(event.enemy as unknown as EnemyStateProps),
								behaviors:
									undefined,
							},
						),
		};
	}
	if (
		event.type ===
		"shot"
	) {
		return {
			...event,
			shot:
				event.shot instanceof
				ShotState
					? event.shot
					: new ShotState(
							event.shot,
						),
		};
	}
	return event;
}

export class StateUpdater {
	#logger: Logger;
	#currentState: Signal<WaveState>;
	#currentUser: Signal<User>;
	#waveProcess: WaveProcess;
	#lastSyncedState: WaveState;
	#isHost: boolean;
	#lastPositionVersion =
		-1;
	#lastStateVersion = 0;
	#lastPositionUpdatedAt =
		-Infinity;

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
		this.#logger =
			logger;
		this.#currentState =
			currentState;
		this.#currentUser =
			currentUser;
		this.#waveProcess =
			waveProcess;
		this.#isHost =
			isHost;
		this.#lastSyncedState =
			currentState.value;
	}

	processMessage =
		(
			message: WebsocketMessage,
			_localEvents: GameEvent[] = [],
		) => {
			if (
				message.type ===
				"game-state-position-updated"
			) {
				this.#handlePosition(
					message,
				);
				return;
			}
			if (
				message.version <=
				this
					.#lastStateVersion
			)
				return;
			this.#lastStateVersion =
				message.version;
			this.#logger.info(
				{
					version:
						message.version,
				},
				"Received game events",
			);
			const localPlayerId =
				this
					.#currentUser
					.value
					.id;
			const events =
				(
					message.events as GameEvent[]
				)
					.filter(
						(
							event,
						) =>
							this
								.#isHost
								? event.type ===
										"bulbroMoved" &&
									event.bulbroId !==
										localPlayerId
								: event.type !==
										"bulbroMoved" ||
									event.bulbroId !==
										localPlayerId,
					)
					.map(
						hydrateEvent,
					)
					.sort(
						(
							a,
							b,
						) =>
							a.occurredAt -
							b.occurredAt,
					);
			const next =
				events.reduce(
					updateState,
					this
						.#currentState
						.value,
				);
			const localPlayer =
				next.players.find(
					(
						player,
					) =>
						player.id ===
						localPlayerId,
				);
			const remotePlayer =
				next.players.find(
					(
						player,
					) =>
						player.id !==
						localPlayerId,
				);
			if (
				!localPlayer ||
				!remotePlayer
			) {
				this.#logger.warn(
					{
						localPlayerId,
					},
					"Network state is missing a player",
				);
				return;
			}
			this.#currentState.value =
				{
					...next,
					players:
						[
							localPlayer,
							remotePlayer,
						],
				};
			this.#lastSyncedState =
				this.#currentState.value;
		};

	#handlePosition(
		message: Extract<
			WebsocketMessage,
			{
				type: "game-state-position-updated";
			}
		>,
	) {
		if (
			message.playerId ===
				this
					.#currentUser
					.value
					.id ||
			message.version <=
				this
					.#lastPositionVersion ||
			message.sentAt <
				this
					.#lastPositionUpdatedAt
		)
			return;
		const state =
			this
				.#currentState
				.value;
		const remotePlayer =
			state.players.find(
				(
					player,
				) =>
					player.id ===
					message.playerId,
			);
		if (
			!remotePlayer
		)
			return;
		this.#lastPositionVersion =
			message.version;
		this.#lastPositionUpdatedAt =
			message.sentAt;
		const now =
			this.#waveProcess.now();
		this.#currentState.value =
			{
				...state,
				players:
					state.players.map(
						(
							player,
						) =>
							player.id ===
							message.playerId
								? player.applyEvent(
										{
											...remotePlayer.moveFromDirection(
												message.position,
												message.direction,
												now,
											),
											deltaTime:
												deltaTime(
													16,
												),
											occurredAt:
												now,
										},
									)
								: player,
					),
			};
	}

	getLastSyncedState(): WaveState {
		return this
			.#lastSyncedState;
	}

	reset(): void {
		this.#lastPositionVersion =
			-1;
		this.#lastStateVersion = 0;
		this.#lastPositionUpdatedAt =
			-Infinity;
		this.#lastSyncedState =
			this.#currentState.value;
	}
}
