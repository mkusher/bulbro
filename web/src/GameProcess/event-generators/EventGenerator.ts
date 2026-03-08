import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { GameEventInternal } from "../../game-events/GameEvents";
import type { WaveState } from "../../waveState";

/**
 * Interface for event generators that produce game events from state.
 */
export interface EventGenerator {
	generate(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): GameEventInternal[];
}
