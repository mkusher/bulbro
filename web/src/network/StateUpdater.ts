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
import type { LiveStateMessage } from "./InGameCommunicationChannel";

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
	/** Sender sequence of the last applied position packet; -1 before the first */
	#lastPositionVersion =
		-1;
	#lastStateVersion = 0;

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
			message: LiveStateMessage,
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
			// Position packets are sent on every change, so once one arrived
			// it is the freshest remote position and batches must not move the
			// remote player back.
			const hasPositionPackets =
				this
					.#lastPositionVersion >=
				0;
			const events =
				(
					message.events as GameEvent[]
				)
					.filter(
						(
							event,
						) =>
							!(
								hasPositionPackets &&
								event.type ===
									"bulbroMoved" &&
								event.bulbroId !==
									localPlayerId
							),
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
			LiveStateMessage,
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
			// Ordered by the sender's sequence only; sentAt is diagnostic.
			message.version <=
				this
					.#lastPositionVersion
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
		this.#lastSyncedState =
			this.#currentState.value;
	}
}
