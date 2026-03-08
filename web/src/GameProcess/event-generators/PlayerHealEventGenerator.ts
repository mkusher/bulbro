import type {
	DeltaTime,
	NowTime,
} from "@/time";
import type { GameEventInternal } from "../../game-events/GameEvents";
import type { WaveState } from "../../waveState";
import type { EventGenerator } from "./EventGenerator";

/**
 * Generates heal events for players whose HP is below max.
 */
export class PlayerHealEventGenerator
	implements
		EventGenerator
{
	generate(
		state: WaveState,
		_deltaTime: DeltaTime,
		now: NowTime,
	): GameEventInternal[] {
		const events: GameEventInternal[] =
			[];

		for (const player of state.players) {
			if (
				player.isAlive() &&
				player.healthPoints <
					player
						.stats
						.maxHp
			) {
				const healResult =
					player.healByHpRegeneration(
						now,
					);
				if (
					healResult !==
						player &&
					typeof healResult ===
						"object" &&
					"type" in
						healResult &&
					healResult.type ===
						"bulbroHealed"
				) {
					events.push(
						healResult,
					);
				}
			}
		}

		return events;
	}
}
