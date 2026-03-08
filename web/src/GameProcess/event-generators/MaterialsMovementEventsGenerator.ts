import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { GameEventInternal } from "../../game-events/GameEvents";
import type { WaveState } from "../../waveState";
import { generateMaterialMovementEvents } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

export class MaterialsMovementEventsGenerator
	implements
		EventGenerator
{
	generate(
		state: WaveState,
		deltaTime: DeltaTime,
		_now: NowTime,
	): GameEventInternal[] {
		return generateMaterialMovementEvents(
			state,
			deltaTime,
		);
	}
}
