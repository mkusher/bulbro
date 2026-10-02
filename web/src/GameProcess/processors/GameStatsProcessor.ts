import type { GameEvent } from "../../game-events/GameEvents";
import { updateStatsFromEvents } from "../../gameStats";
import type { GameEventsProcessor } from "../index";

export class GameStatsProcessor
	implements
		GameEventsProcessor
{
	handleEvents(
		events: GameEvent[],
	): void {
		updateStatsFromEvents(
			events,
		);
	}
}
