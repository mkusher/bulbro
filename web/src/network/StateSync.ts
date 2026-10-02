import {
	computed,
	effect,
	type Signal,
} from "@preact/signals";
import type { Logger } from "pino";
import type { PlayerControl } from "@/controls";
import type { WaveProcess } from "@/GameProcess";
import type { GameEventQueue } from "@/game-events/GameEvents";
import { zeroPoint } from "@/geometry";
import { throttle } from "@/signals";
import type { WaveState } from "@/waveState";
import type {
	InGameCommunicationChannel,
	WebsocketMessage,
} from "./InGameCommunicationChannel";
import { isLocallyAuthoritativeEvent } from "./networkEventFilter";
import type { RemoteRepeatLastKnownDirectionControl } from "./RemoteControl";
import type { StateUpdater } from "./StateUpdater";

export const persistDelay = 50;

export class StateSync {
	#logger: Logger;
	#isStarted = false;
	#channel: InGameCommunicationChannel;
	#stateUpdater: StateUpdater;
	#gameEventQueue: GameEventQueue;
	#currentState: Signal<WaveState>;
	#remotePlayerControl: RemoteRepeatLastKnownDirectionControl;
	#localPlayerControl: PlayerControl;
	#isHost: boolean;
	#lastReceivedVersion = 0;
	#sentVersion = 0;
	#gameId: string;
	#localPlayerId: string;
	#localDispose?: () => void;
	#sendInterval?: ReturnType<
		typeof setInterval
	>;
	#unsubscribe: () => void;

	constructor({
		logger,
		gameId,
		localPlayerId,
		isHost,
		inGameCommunicationChannel,
		stateUpdater,
		gameEventQueue,
		currentState,
		localPlayerControl,
		remoteControl,
		waveProcess:
			_waveProcess,
	}: {
		logger: Logger;
		gameId: string;
		localPlayerId: string;
		isHost: boolean;
		inGameCommunicationChannel: InGameCommunicationChannel;
		stateUpdater: StateUpdater;
		gameEventQueue: GameEventQueue;
		currentState: Signal<WaveState>;
		localPlayerControl: PlayerControl;
		remoteControl: RemoteRepeatLastKnownDirectionControl;
		waveProcess: WaveProcess;
	}) {
		this.#logger =
			logger;
		this.#gameId =
			gameId;
		this.#localPlayerId =
			localPlayerId;
		this.#isHost =
			isHost;
		this.#channel =
			inGameCommunicationChannel;
		this.#stateUpdater =
			stateUpdater;
		this.#localPlayerControl =
			localPlayerControl;
		this.#remotePlayerControl =
			remoteControl;
		this.#gameEventQueue =
			gameEventQueue;
		this.#currentState =
			currentState;
		this.#unsubscribe =
			this.#channel.onMessage(
				this
					.#onMessage,
			);
	}

	#onMessage =
		(
			message: WebsocketMessage,
		) => {
			if (
				!this
					.#isStarted ||
				message.gameId !==
					this
						.#gameId ||
				message.type ===
					"next-wave-player-ready" ||
				message.type ===
					"next-wave-player-not-ready" ||
				message.type ===
					"next-wave-started"
			)
				return;
			if (
				message.type ===
				"game-state-position-updated"
			) {
				if (
					message.playerId ===
					this
						.#localPlayerId
				)
					return;
				this.#stateUpdater.processMessage(
					message,
				);
				return;
			}
			if (
				this
					.#isHost ===
				(message.type ===
					"game-state-updated-by-host")
			)
				return;
			if (
				message.version <=
				this
					.#lastReceivedVersion
			)
				return;
			this.#lastReceivedVersion =
				message.version;
			this.#stateUpdater.processMessage(
				message,
			);
			this.#remotePlayerControl.onMessage(
				message,
			);
		};

	start() {
		if (
			this
				.#isStarted
		)
			return;
		this.#isStarted = true;
		this.#sendInterval =
			setInterval(
				this
					.#sendEvents,
				persistDelay,
			);
		// Position packets carry a per-wave sender sequence starting at 1.
		let positionVersion = 1;
		const playerId =
			this
				.#localPlayerId;
		const emptyPosition =
			zeroPoint();
		const playerPosition =
			throttle(
				computed(
					() =>
						this.#currentState.value.players.find(
							(
								p,
							) =>
								p.id ===
								playerId,
						)
							?.position ??
						emptyPosition,
				),
				20,
			);
		this.#localDispose =
			effect(
				() => {
					const position =
						playerPosition.value;
					const direction =
						this
							.#localPlayerControl
							.direction;
					if (
						!this
							.#isStarted
					)
						return;
					void this.#channel
						.send(
							{
								type: "game-state-position-updated",
								gameId:
									this
										.#gameId,
								playerId,
								position,
								direction,
								version:
									positionVersion++,
								sentAt:
									Date.now(),
							},
						)
						.catch(
							(
								error,
							) =>
								this.#logger.error(
									{
										error,
									},
									"Could not send player position",
								),
						);
				},
			);
	}

	#sendEvents =
		() => {
			const events =
				this.#gameEventQueue
					.flush()
					.filter(
						(
							event,
						) =>
							isLocallyAuthoritativeEvent(
								event,
								this
									.#isHost,
								this
									.#localPlayerId,
							),
					);
			if (
				events.length ===
				0
			)
				return;
			void this.#channel
				.send(
					{
						type: this
							.#isHost
							? "game-state-updated-by-host"
							: "game-state-updated-by-guest",
						events,
						gameId:
							this
								.#gameId,
						version:
							++this
								.#sentVersion,
						sentAt:
							Date.now(),
					},
				)
				.catch(
					(
						error,
					) =>
						this.#logger.error(
							{
								error,
							},
							"Could not send game events",
						),
				);
		};

	stop() {
		this.#isStarted = false;
		if (
			this
				.#sendInterval
		)
			clearInterval(
				this
					.#sendInterval,
			);
		this.#sendInterval =
			undefined;
		this.#localDispose?.();
		this.#localDispose =
			undefined;
		this.#unsubscribe();
	}
}
