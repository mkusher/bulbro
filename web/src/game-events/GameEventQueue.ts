import {
	type Signal,
	signal,
} from "@preact/signals";
import type {
	GameEvent,
	GameEventQueue,
} from "./GameEvents";

export class InMemoryGameEventQueue
	implements
		GameEventQueue
{
	#events: Signal<
		GameEvent[]
	> =
		signal(
			[],
		);

	addEvent(
		event: GameEvent,
	): void {
		this.#events.value =
			[
				...this
					.#events
					.value,
				event,
			];
	}

	flush(): GameEvent[] {
		const events =
			this
				.#events
				.value;
		this.#events.value =
			[];
		return events;
	}
}
