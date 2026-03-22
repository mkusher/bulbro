import type {
	GameEvent,
	GameEventQueue,
} from "./GameEvents";

export class VoidGameEventQueue
	implements
		GameEventQueue
{
	constructor() {}

	addEvent(
		_event: GameEvent,
	): void {}

	flush(): GameEvent[] {
		return [];
	}
}
