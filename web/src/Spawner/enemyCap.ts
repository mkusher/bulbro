import type { EnemyState } from "@/enemy";
import type { GameEventInternal } from "@/game-events/GameEvents";
import type { WaveState } from "@/waveState";

/** Brotato never has more than 100 enemies alive at once */
export const MAX_ALIVE_ENEMIES = 100;

type Random =
	() => number;

/** Trees are neutral, like in Brotato, and don't count towards the cap */
function isCapped(
	enemy: EnemyState,
): boolean {
	return (
		enemy.behaviorType !==
		"stationary"
	);
}

/**
 * Keeps at most {@link MAX_ALIVE_ENEMIES} enemies alive or about to appear.
 * Like Brotato, every spawn over the cap removes a random alive enemy
 * without loot. Spawns are skipped only when nothing can be removed.
 */
export function applyEnemyCap(
	state: WaveState,
	events: GameEventInternal[],
	random: Random = Math.random,
): GameEventInternal[] {
	const removable =
		state.enemies.filter(
			(
				enemy,
			) =>
				!enemy.killedAt &&
				isCapped(
					enemy,
				),
		);
	const spawning =
		state.objects.filter(
			(
				object,
			) =>
				object.type ===
					"spawning-enemy" &&
				isCapped(
					object.enemy,
				),
		).length;
	let alive =
		removable.length +
		spawning;

	return events.flatMap(
		(
			event,
		): GameEventInternal[] => {
			if (
				event.type !==
					"spawnEnemy" ||
				!isCapped(
					event.enemy,
				)
			) {
				return [
					event,
				];
			}
			if (
				alive <
				MAX_ALIVE_ENEMIES
			) {
				alive++;
				return [
					event,
				];
			}
			const [
				despawned,
			] =
				removable.splice(
					Math.floor(
						random() *
							removable.length,
					),
					1,
				);
			if (
				!despawned
			) {
				return [];
			}
			return [
				{
					type: "enemyDespawned",
					enemyId:
						despawned.id,
				},
				event,
			];
		},
	);
}
