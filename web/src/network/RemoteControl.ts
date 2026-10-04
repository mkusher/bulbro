import { signal } from "@preact/signals";
import type { PlayerControl } from "@/controls";
import type { GameEvent } from "@/game-events/GameEvents";
import { zeroPoint } from "@/geometry";
import type { LiveStateMessage } from "./InGameCommunicationChannel";

export class RemoteRepeatLastKnownDirectionControl
	implements
		PlayerControl
{
	#playerId: string;
	#direction =
		signal(
			zeroPoint(),
		);
	#isHost: boolean;
	#isStarted = false;
	#lastPositionVersion =
		-1;
	#lastStateVersion = 0;

	constructor(
		isHost: boolean,
		playerId: string,
	) {
		this.#playerId =
			playerId;
		this.#isHost =
			isHost;
	}

	async start() {
		this.#direction.value =
			zeroPoint();
		this.#lastPositionVersion =
			-1;
		this.#lastStateVersion = 0;
		this.#isStarted = true;
	}

	async stop() {
		this.#isStarted = false;
		this.#direction.value =
			zeroPoint();
	}

	onMessage(
		message: LiveStateMessage,
	) {
		if (
			!this
				.#isStarted
		)
			return;
		if (
			message.type ===
			"game-state-position-updated"
		) {
			if (
				message.playerId !==
					this
						.#playerId ||
				message.version <=
					this
						.#lastPositionVersion
			)
				return;
			this.#lastPositionVersion =
				message.version;
			this.#direction.value =
				message.direction;
			return;
		}
		// Position packets and batches have independent sequences. Once positions
		// arrive, an older batch must not change direction or undo a stop packet.
		if (
			this
				.#lastPositionVersion >=
				0 ||
			message.version <=
				this
					.#lastStateVersion ||
			this
				.#isHost ===
				(message.type ===
					"game-state-updated-by-host")
		)
			return;
		this.#lastStateVersion =
			message.version;
		const movement =
			(
				message.events as GameEvent[]
			).findLast(
				(
					event,
				) =>
					event.type ===
						"bulbroMoved" &&
					event.bulbroId ===
						this
							.#playerId,
			);
		this.#direction.value =
			movement?.type ===
			"bulbroMoved"
				? movement.direction
				: zeroPoint();
	}

	get signal() {
		return this
			.#direction;
	}
	get direction() {
		return this
			.#direction
			.value;
	}
}
