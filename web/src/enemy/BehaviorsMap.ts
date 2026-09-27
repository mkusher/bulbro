import { ChasingBehavior } from "./ChasingBehavior";
import type { EnemyBehaviorsType } from "./EnemyCharacter";
import { KeepkingDistanceBehaviors } from "./KeepingDistanceBehaviors";
import { RageRunningBehaviors } from "./RageRunningBehaviors";
import { StationaryBehavior } from "./StationaryBehavior";

export function getBehaviors(
	behavior?: typeof EnemyBehaviorsType.infer,
) {
	if (
		behavior ===
		"chasing"
	) {
		return new ChasingBehavior();
	}
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
	if (
		behavior ===
		"stationary"
	) {
		return new StationaryBehavior();
	}
	return new ChasingBehavior();
}
