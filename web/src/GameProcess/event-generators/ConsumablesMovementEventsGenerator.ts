import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { GameEventInternal } from "../../game-events/GameEvents";
import type { WaveState } from "../../waveState";
import { generateConsumableMovementEvents } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

export class ConsumablesMovementEventsGenerator
	implements
		EventGenerator
{
	generate(
		state: WaveState,
		deltaTime: DeltaTime,
		_now: NowTime,
	): GameEventInternal[] {
		return generateConsumableMovementEvents(
			state,
			deltaTime,
		);
	}
}
