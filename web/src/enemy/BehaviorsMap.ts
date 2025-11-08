import { DefaultEnemyBehaviors } from "./DefaultEnemyBehaviors";
import type { EnemyBehaviorsType } from "./EnemyCharacter";
import { KeepkingDistanceBehaviors } from "./KeepingDistanceBehaviors";
import { RageRunningBehaviors } from "./RageRunningBehaviors";

export function getBehaviors(
	behavior?: typeof EnemyBehaviorsType.infer,
) {
	if (
		behavior ===
		"rage-running"
	) {
		return new RageRunningBehaviors();
	}
	if (
		behavior ===
		"keeping-distance"
	) {
		return new KeepkingDistanceBehaviors();
	}
	return new DefaultEnemyBehaviors();
}
