import type { EnemyEvent } from "@/game-events/GameEvents";
import type { EnemyBehaviors } from "./EnemyBehaviors";

/**
 * Behavior for enemies that never move nor attack (e.g. trees).
 * They are also not affected by knockback.
 */
export class StationaryBehavior
	implements
		EnemyBehaviors
{
	move(): EnemyEvent[] {
		return [];
	}

	attack(): EnemyEvent[] {
		return [];
	}
}
