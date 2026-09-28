import type {
	GameEvent,
	GameEventQueue,
} from "./GameEvents";

export class InMemoryGameEventQueue
	implements
		GameEventQueue
{
	#events: GameEvent[] =
		[];

	addEvent(
		event: GameEvent,
	): void {
		this.#events.push(
			event,
		);
	}

	flush(): GameEvent[] {
		const events =
			this
				.#events;
		this.#events =
			[];
		return events;
	}
}
