import {
	type CurrentState,
	type PlayerState,
	type EnemyState,
	type WeaponState,
	type ShotState,
	type RoundState,
	getTimeLeft,
} from "./currentState";
import { v4 as uuidv4 } from "uuid";
import { direction, distance, type Position } from "./geometry";

export const spawnIntervalForRound = (round: RoundState) => {
	const wave = round.wave;
	const difficulty = round.difficulty + 1;

	return 2000 / wave / difficulty;
};
export const shouldSpawnEnemy = (now: number, state: CurrentState) => {
	const spawnInterval = spawnIntervalForRound(state.round);
	const timeSinceLastSpawn = now - (state.lastSpawnAt?.getTime() ?? 0);
	const timeLeftInRound = getTimeLeft(state.round);
	const timeModifier =
		(1 - timeLeftInRound / state.round.duration / 1000) * timeSinceLastSpawn;
	return (
		((timeSinceLastSpawn + timeModifier) / spawnInterval) * Math.random() >= 1
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
	const chanceForReloaded = elapsed / reloadTime / 1000;
	return chanceForReloaded + (chanceForReloaded * attackSpeed) / 100 >= 1;
}

export function findClosestPlayerInRange(
	enemy: EnemyState,
	players: PlayerState[],
): PlayerState | undefined {
	let closest: PlayerState | undefined;
	let minDist = Infinity;
	for (const player of players) {
		const dist = distance(enemy.position, player.position);
		if (dist < minDist) {
			minDist = dist;
			closest = player;
		}
	}
	return closest;
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
	player: PlayerState | EnemyState,
	shooterType: "player" | "enemy",
	weapon: WeaponState,
	targetPosition: Position,
): ShotState {
	const id = uuidv4();
	const currentPosition = { ...player.position };
	const playerDamage = player.stats.damage ?? 0;
	const playerRange = player.stats.range ?? 0;
	const weaponDamage = weapon.statsBonus.damage ?? 0;
	const weaponRange = weapon.statsBonus.range ?? 0;
	return {
		id,
		shooterType,
		shooterId: player.id,
		damage: playerDamage + weaponDamage,
		range: playerRange + weaponRange,
		position: currentPosition,
		startPosition: currentPosition,
		direction: direction(currentPosition, targetPosition),
		speed: shotSpeed,
	};
}

export function isInRange(
	player: PlayerState | EnemyState,
	enemy: EnemyState | PlayerState,
	weapon: WeaponState,
) {
	return (
		distance(player.position, enemy.position) <=
		(player.stats.range ?? 0) + (weapon.statsBonus.range ?? 0)
	);
}
