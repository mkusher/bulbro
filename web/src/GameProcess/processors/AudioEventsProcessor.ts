import type { Signal } from "@preact/signals";
import { AudioController } from "../../audio/AudioController";
import type { GameEvent } from "../../game-events/GameEvents";
import type { GameEventsProcessor } from "../index";
import type { WaveState } from "../../waveState";

export class AudioEventsProcessor
	implements
		GameEventsProcessor
{
	#audioController: AudioController;

	constructor(
		waveStateSignal: Signal<WaveState | null>,
	) {
		this.#audioController =
			new AudioController(
				waveStateSignal,
			);
	}

	handleEvents(
		events: GameEvent[],
	): void {
		this.#audioController.handleEvents(
			events,
		);
	}
}
