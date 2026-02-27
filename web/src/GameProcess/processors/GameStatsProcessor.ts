import type { Signal } from "@preact/signals";
import type { GameEvent } from "../../game-events/GameEvents";
import type { GameEventsProcessor } from "../index";
import { updateStatsFromStateChange } from "../../gameStats";
import type { WaveState } from "../../waveState";

export class GameStatsProcessor
	implements
		GameEventsProcessor
{
	#waveStateSignal: Signal<WaveState | null>;
	#prevState: WaveState | null;

	constructor(
		waveStateSignal: Signal<WaveState | null>,
	) {
		this.#waveStateSignal =
			waveStateSignal;
		this.#prevState =
			waveStateSignal.value;
	}

	handleEvents(
		_events: GameEvent[],
	): void {
		const newState =
			this
				.#waveStateSignal
				.value;
		if (
			!this
				.#prevState ||
			!newState
		)
			return;
		updateStatsFromStateChange(
			this
				.#prevState,
			newState,
		);
		this.#prevState =
			newState;
	}
}
