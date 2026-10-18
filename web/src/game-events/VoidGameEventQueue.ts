import type {
	GameEvent,
	GameEventQueue,
} from "./GameEvents";

export class VoidGameEventQueue
	implements
		GameEventQueue
{
	addEvent(
		_event: GameEvent,
	): void {}

	flush(): GameEvent[] {
		return [];
	}
}
