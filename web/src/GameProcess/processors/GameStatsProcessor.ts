import type { GameEvent } from "../../game-events/GameEvents";
import type { GameEventsProcessor } from "../index";
import { updateStatsFromEvents } from "../../gameStats";

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
