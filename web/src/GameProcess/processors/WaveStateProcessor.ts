import type { Signal } from "@preact/signals";
import type { GameEvent } from "../../game-events/GameEvents";
import type { GameEventsProcessor } from "../index";
import type { WaveState } from "../../waveState";
import { updateState } from "../../waveState";

export class WaveStateProcessor
	implements
		GameEventsProcessor
{
	#waveStateSignal: Signal<WaveState | null>;

	constructor(
		waveStateSignal: Signal<WaveState | null>,
	) {
		this.#waveStateSignal =
			waveStateSignal;
	}

	handleEvents(
		events: GameEvent[],
	): void {
		const state =
			this
				.#waveStateSignal
				.value;
		if (
			!state
		)
			return;

		let newState =
			events.reduce(
				(
					currentState,
					event,
				) =>
					updateState(
						currentState,
						event,
					),
				state,
			);
		newState =
			{
				...newState,
				players:
					newState.players.map(
						(
							p,
						) =>
							p.aim(
								newState.enemies,
							),
					),
			};
		this.#waveStateSignal.value =
			newState;
	}

	get state() {
		return this
			.#waveStateSignal
			.value;
	}
}
