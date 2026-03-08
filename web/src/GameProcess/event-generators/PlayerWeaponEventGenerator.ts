import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { GameEventInternal } from "../../game-events/GameEvents";
import type { WaveState } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

/**
 * Generates weapon attack events for all players.
 */
export class PlayerWeaponEventGenerator
	implements
		EventGenerator
{
	generate(
		state: WaveState,
		deltaTime: DeltaTime,
		now: NowTime,
	): GameEventInternal[] {
		const events: GameEventInternal[] =
			[];

		for (const player of state.players) {
			events.push(
				...player.attack(
					state.enemies,
					deltaTime,
					now,
				),
			);
		}

		return events;
	}
}
