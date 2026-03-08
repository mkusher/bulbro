import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { GameEventInternal } from "../../game-events/GameEvents";
import type { WaveState } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

/**
 * Generates movement and attack events for all living enemies.
 */
export class EnemyBehaviorEventGenerator
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

		for (const enemy of state.enemies) {
			if (
				enemy.killedAt
			)
				continue;
			events.push(
				...enemy.move(
					state,
					now,
					deltaTime,
				),
			);
			events.push(
				...enemy.attack(
					state,
					now,
					deltaTime,
				),
			);
		}

		return events;
	}
}
