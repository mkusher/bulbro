import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { GameEventInternal } from "../../game-events/GameEvents";
import type { WaveState } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

/**
 * Generates movement and attack events for all living enemies.
 * Enemies only see living Bulbros: dead ones are neither chased nor attacked.
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
		const targetableState: WaveState =
			{
				...state,
				players:
					state.players.filter(
						(
							p,
						) =>
							p.isAlive(),
					),
			};

		for (const enemy of state.enemies) {
			if (
				enemy.killedAt
			)
				continue;
			events.push(
				...enemy.move(
					targetableState,
					now,
					deltaTime,
				),
			);
			events.push(
				...enemy.attack(
					targetableState,
					now,
					deltaTime,
				),
			);
		}

		return events;
	}
}
