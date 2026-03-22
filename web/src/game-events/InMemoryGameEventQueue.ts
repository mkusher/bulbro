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
	#interval:
		| NodeJS.Timeout
		| undefined;
	#timeout = 50;
	#newEvents: GameEvent[] =
		[];
	#events: Signal<
		GameEvent[]
	> =
		signal(
			[],
		);

	constructor() {
		this.#scheduleUpdate();
	}

	addEvent(
		event: GameEvent,
	): void {
		this.#newEvents.push(
			event,
		);
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

	#scheduleUpdate() {
		this.#interval =
			setTimeout(
				this
					.#update,
				this
					.#timeout,
			);
	}

	#update =
		() => {
			if (
				this
					.#newEvents
					.length >
				0
			) {
				this.#events.value =
					[
						...this
							.#events
							.value,
						...this
							.#newEvents,
					];
				this.#newEvents =
					[];
			}
			this.#scheduleUpdate();
		};
}
