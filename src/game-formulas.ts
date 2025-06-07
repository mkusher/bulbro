import type {
	CurrentState,
	PlayerState,
	EnemyState,
	WeaponState,
	ShotState,
} from "./currentState";
import { v4 as uuidv4 } from "uuid";
import { direction, distance, type Position } from "./geometry";

export const shouldSpawnEnemy = (
	now: number,
	spawnInterval: number,
	state: CurrentState,
) => {
	return (
		((now - (state.lastSpawnAt ?? 0)) / spawnInterval) * Math.random() >= 1
	);
};
/** Determines if a weapon is ready to shoot.
 * Calculates elapsed time since last shot, divided by reload time, scaled by attack speed.
 * Returns true if the weapon is ready to fire (fraction >= 1).
 */
export function isWeaponReadyToShoot(
	lastStrikedAt: Date,
	reloadTime: number,
	attackSpeed: number,
	now: number,
): boolean {
	const elapsed = now - lastStrikedAt.getTime();
	return (elapsed / reloadTime) * attackSpeed >= 1;
}

/** Finds the closest enemy to a player based on Euclidean distance. */
export function findClosestEnemyInRange(
	player: PlayerState,
	enemies: EnemyState[],
): EnemyState | undefined {
	let closest: EnemyState | undefined;
	let minDist = Infinity;
	for (const enemy of enemies) {
		const dist = distance(enemy.position, player.position);
		if (dist < minDist) {
			minDist = dist;
			closest = enemy;
		}
	}
	return closest;
}

const shotSpeed = 3000;
export function shoot(
	player: PlayerState,
	weapon: WeaponState,
	targetPosition: Position,
): ShotState {
	const id = uuidv4();
	const currentPosition = { ...player.position };
	const playerDamage = player.stats.damage;
	const playerRange = player.stats.range;
	const weaponDamage = weapon.statsBonus.damage ?? 0;
	const weaponRange = weapon.statsBonus.range ?? 0;
	return {
		id,
		shooterType: "player",
		shooterId: player.id,
		damage: playerDamage + weaponDamage,
		range: playerRange + weaponRange,
		position: currentPosition,
		startPosition: currentPosition,
		direction: direction(currentPosition, targetPosition),
		speed: shotSpeed,
	};
}
