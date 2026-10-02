import type { NextWaveStarted } from "@bulbro/network-protocol";
import {
	computed,
	signal,
} from "@preact/signals";
import { BulbroState } from "@/bulbro/BulbroState";
import {
	createMainControls,
	type PlayerControl,
} from "@/controls";
import {
	isLoading,
	markAsLoading,
	markAsRunningWave,
	waveResult,
} from "@/currentGameProcess";
import type {
	GameProcess,
	WaveProcess,
	WavePromises,
} from "@/GameProcess";
import {
	type GameEvent,
	withEventMeta,
} from "@/game-events/GameEvents";
import {
	finalizeWaveStats,
	startWaveTracking,
} from "@/gameStats";
import type { Logger } from "@/logger";
import {
	deltaTime,
	nowTime,
} from "@/time";
import {
	fromJSON,
	getRoundElapsedTime,
	nextWave,
	waveState,
} from "@/waveState";
import { currentUser } from "./currentUser";
import {
	orderPlayersLocalFirst,
	remotePlayerIdFor,
} from "./gameParticipants";
import type {
	InGameCommunicationChannel,
	WebsocketMessage,
} from "./InGameCommunicationChannel";
import type { Lobby } from "./LobbySocketMessages";
import { isLocallyAuthoritativeEvent } from "./networkEventFilter";
import { RemoteRepeatLastKnownDirectionControl } from "./RemoteControl";
import { StateSync } from "./StateSync";
import { StateUpdater } from "./StateUpdater";

type BulbroStateProperties =
	ConstructorParameters<
		typeof BulbroState
	>[0];

export class NetworkGameConnection {
	#logger: Logger;
	#inGameCommunicationChannel: InGameCommunicationChannel;
	#lobby: Lobby;
	#gameProcess: GameProcess;
	#stateSync!: StateSync;
	#isHost: boolean;
	#remoteControl: RemoteRepeatLastKnownDirectionControl;
	#mainControl: PlayerControl;
	#remotePlayerId: string;
	#nextWaveReadiness =
		signal<{
			wave: number;
			playerIds: string[];
		}>(
			{
				wave: 0,
				playerIds:
					[],
			},
		);
	#isStartingNextWave = false;

	/**
	 * Players that finished shopping and are ready for the upcoming wave.
	 */
	readonly readyForNextWave =
		computed(
			() => {
				const readiness =
					this
						.#nextWaveReadiness
						.value;
				return readiness.wave ===
					waveState
						.value
						.round
						.wave +
						1
					? readiness.playerIds
					: [];
			},
		);

	get id() {
		return this
			.#lobby
			.id;
	}

	constructor(
		logger: Logger,
		inGameCommunicationChannel: InGameCommunicationChannel,
		lobby: Lobby,
		gameProcess: GameProcess,
		isHost: boolean,
	) {
		this.#logger =
			logger;
		this.#lobby =
			lobby;
		this.#remotePlayerId =
			remotePlayerIdFor(
				lobby,
				currentUser
					.value
					.id,
			);
		this.#gameProcess =
			gameProcess;
		this.#inGameCommunicationChannel =
			inGameCommunicationChannel;
		this.#isHost =
			isHost;
		this.#useNetworkEventFilter();
		this.#mainControl =
			createMainControls();
		this.#remoteControl =
			new RemoteRepeatLastKnownDirectionControl(
				this
					.#isHost,
				this
					.#remotePlayerId,
			);
		this.#inGameCommunicationChannel.onMessage(
			this
				.#onNextWaveMessage,
		);
	}

	#useNetworkEventFilter() {
		const isHost =
			this
				.#isHost;
		this.#gameProcess.setEventFilter(
			(
				event,
			) =>
				isLocallyAuthoritativeEvent(
					event,
					isHost,
					currentUser
						.value
						.id,
				),
		);
	}

	/**
	 * Locks in the local player's shop results for the upcoming wave. The
	 * server starts the wave once every player is ready.
	 */
	async markReadyForNextWave() {
		const state =
			waveState.value;
		const localPlayerId =
			currentUser
				.value
				.id;
		const player =
			state.players.find(
				(
					p,
				) =>
					p.id ===
					localPlayerId,
			);
		if (
			!player
		)
			throw new Error(
				"Local player is not in the game",
			);
		const wave =
			state
				.round
				.wave +
			1;
		this.#addReadyPlayer(
			wave,
			localPlayerId,
		);
		await this.#inGameCommunicationChannel.send(
			{
				type: "next-wave-player-ready",
				gameId:
					this
						.id,
				wave,
				playerId:
					localPlayerId,
				player:
					player.toJSON(),
				sentAt:
					Date.now(),
			},
		);
	}

	/**
	 * Withdraws the local player's readiness to keep shopping. Has no effect
	 * when the server already started the wave.
	 */
	async markNotReadyForNextWave() {
		const localPlayerId =
			currentUser
				.value
				.id;
		const wave =
			waveState
				.value
				.round
				.wave +
			1;
		this.#removeReadyPlayer(
			wave,
			localPlayerId,
		);
		await this.#inGameCommunicationChannel.send(
			{
				type: "next-wave-player-not-ready",
				gameId:
					this
						.id,
				wave,
				playerId:
					localPlayerId,
				sentAt:
					Date.now(),
			},
		);
	}

	#removeReadyPlayer(
		wave: number,
		playerId: string,
	) {
		const readiness =
			this
				.#nextWaveReadiness
				.value;
		if (
			readiness.wave !==
			wave
		)
			return;
		this.#nextWaveReadiness.value =
			{
				wave,
				playerIds:
					readiness.playerIds.filter(
						(
							id,
						) =>
							id !==
							playerId,
					),
			};
	}

	#addReadyPlayer(
		wave: number,
		playerId: string,
	) {
		const readiness =
			this
				.#nextWaveReadiness
				.value;
		const playerIds =
			readiness.wave ===
			wave
				? readiness.playerIds
				: [];
		if (
			playerIds.includes(
				playerId,
			)
		)
			return;
		this.#nextWaveReadiness.value =
			{
				wave,
				playerIds:
					[
						...playerIds,
						playerId,
					],
			};
	}

	#onNextWaveMessage =
		(
			message: WebsocketMessage,
		) => {
			if (
				!(
					"gameId" in
					message
				) ||
				message.gameId !==
					this
						.id
			)
				return;
			switch (
				message.type
			) {
				case "next-wave-player-ready":
					this.#addReadyPlayer(
						message.wave,
						message.playerId,
					);
					return;
				case "next-wave-player-not-ready":
					this.#removeReadyPlayer(
						message.wave,
						message.playerId,
					);
					return;
				case "next-wave-started":
					this.#startNextWave(
						message,
					).catch(
						(
							error,
						) =>
							this.#logger.error(
								{
									error,
								},
								"Could not start the next wave",
							),
					);
					return;
			}
		};

	async #startNextWave(
		message: typeof NextWaveStarted.infer,
	) {
		const state =
			waveState.value;
		if (
			this
				.#isStartingNextWave ||
			message.wave !==
				state
					.round
					.wave +
					1
		) {
			this.#logger.warn(
				{
					wave: message.wave,
					currentWave:
						state
							.round
							.wave,
				},
				"Ignoring an unexpected next wave start",
			);
			return;
		}
		this.#isStartingNextWave = true;
		// Players are host first, so start positions match on every client.
		const prepared =
			nextWave(
				{
					...state,
					players:
						message.players.map(
							(
								player,
							) =>
								new BulbroState(
									player as BulbroStateProperties,
								),
						),
				},
				withEventMeta(
					{
						type: "tick",
					},
					deltaTime(
						0,
					),
					nowTime(
						0,
					),
				) as Extract<
					GameEvent,
					{
						type: "tick";
					}
				>,
			);
		fromJSON(
			{
				...prepared,
				players:
					orderPlayersLocalFirst(
						prepared.players,
						currentUser
							.value
							.id,
					),
			},
		);
		this.#nextWaveReadiness.value =
			{
				wave: 0,
				playerIds:
					[],
			};

		markAsLoading();
		startWaveTracking(
			message.wave,
		);
		try {
			// The previous wave cleared the filter when it finished.
			this.#useNetworkEventFilter();
			const promises =
				this.startRemote();
			await promises.waveInitPromise;
			this.onStart(
				promises,
			);
			this.#isStartingNextWave = false;
			markAsRunningWave();
			const result =
				await promises.wavePromise;
			finalizeWaveStats(
				getRoundElapsedTime(
					waveState
						.value
						.round,
				),
			);
			waveResult.value =
				result;
		} finally {
			this.#isStartingNextWave = false;
			isLoading.value = false;
		}
	}

	createControls() {
		return [
			this
				.#mainControl,
			this
				.#remoteControl,
		];
	}

	onStart({
		waveInitPromise,
		wavePromise,
	}: WavePromises) {
		waveInitPromise.then(
			(
				waveProcess,
			) => {
				this.#startStateSync(
					this
						.#isHost,
					waveProcess,
				);
			},
		);

		wavePromise.finally(
			() => {
				this.#stateSync?.stop();
				this.#gameProcess.setEventFilter(
					null,
				);
			},
		);
	}

	startRemote() {
		const {
			wavePromise,
			waveInitPromise,
		} =
			this.#gameProcess.startWave(
				this.createControls(),
			);

		return {
			wavePromise,
			waveInitPromise,
		};
	}

	#startStateSync(
		isHost: boolean,
		waveProcess: WaveProcess,
	) {
		const stateUpdater =
			new StateUpdater(
				{
					logger:
						this.#logger.child(
							{
								component:
									"state-updater",
							},
						),
					currentState:
						waveState,
					currentUser,
					waveProcess,
					isHost,
				},
			);

		this.#stateSync =
			new StateSync(
				{
					logger:
						this.#logger.child(
							{
								component:
									"state-sync",
							},
						),
					gameId:
						this
							.#lobby
							.id,
					localPlayerId:
						currentUser
							.value
							.id,
					isHost,
					inGameCommunicationChannel:
						this
							.#inGameCommunicationChannel,
					stateUpdater,
					currentState:
						waveState,
					localPlayerControl:
						this
							.#mainControl,
					remoteControl:
						this
							.#remoteControl,
					waveProcess,
					gameEventQueue:
						waveProcess.eventQueue,
				},
			);
		this.#stateSync.start();
	}
}
