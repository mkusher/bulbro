import {
	type WaveState,
	type WeaponState,
	type RoundState,
	getTimeLeft,
} from "./waveState";
import type { BulbroState } from "./bulbro";
import type { EnemyState } from "./enemy/EnemyState";
import { v4 as uuidv4 } from "uuid";
import type { NowTime } from "./time";
import {
	addition,
	direction,
	distance,
	type Position,
	type Size,
} from "./geometry";
import { ShotState } from "./shot/ShotState";
import type { Stats } from "./bulbro";

export const minWeaponRange = 25;

// Base stats for all Bulbros
export const baseStats: Stats = {
	maxHp: 10,
	hpRegeneration: 0,
	lifeSteal: 0,
	speed: 450,
	harvesting: 0,
	damage: 0,
	meleeDamage: 0,
	rangedDamage: 0,
	elementalDamage: 0,
	attackSpeed: 0,
	critChance: 0,
	engineering: 0,
	range: 0,
	armor: 0,
	dodge: 0,
	luck: 0,
	pickupRange: 100,
	knockback: 0,
};

// Stat bonus types - plain numeric values
export type StatBonus = {
	[K in keyof Stats]?: number;
};

// Define which stats use percentage bonuses vs absolute values
const percentageStats: Set<keyof Stats> = new Set<keyof Stats>([
	"speed",
	"damage",
	"meleeDamage",
	"rangedDamage",
	"elementalDamage",
	"attackSpeed",
	"critChance",
	"engineering",
	"luck",
	"pickupRange",
]);

// Helper function to calculate final stats from base stats and bonuses
export function calculateStats(bonuses: StatBonus): Stats {
	const finalStats = { ...baseStats };

	for (const [key, bonus] of Object.entries(bonuses)) {
		if (typeof bonus === "number") {
			const statKey = key as keyof Stats;
			const baseValue = baseStats[statKey];

			if (percentageStats.has(statKey)) {
				finalStats[statKey] = baseValue * (1 + bonus / 100);
			} else {
				finalStats[statKey] = baseValue + bonus;
			}
		}
	}

	return finalStats;
}

export type Difficulty = 0 | 1 | 2 | 3 | 4 | 5;
export const isDifficulty = (
	maybeDifficulty: number,
): maybeDifficulty is Difficulty =>
	maybeDifficulty >= 0 && maybeDifficulty <= 5;

export const spawnIntervalForRound = (round: RoundState) => {
	const wave = round.wave;
	const difficulty = round.difficulty + 1;

	return 2000 / wave / difficulty;
};
export const shouldSpawnEnemy = (now: NowTime, state: WaveState) => {
	const spawnInterval = spawnIntervalForRound(state.round);
	const timeSinceLastSpawn = now - (state.lastSpawnAt ?? 0);
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
	lastStrikedAt: number,
	reloadTime: number,
	attackSpeed: number,
	now: NowTime,
): boolean {
	const elapsed = now - lastStrikedAt;
	const chanceForReloaded = elapsed / reloadTime / 1000;
	return chanceForReloaded + (chanceForReloaded * attackSpeed) / 100 >= 1;
}

export type WithPosition = { position: Position };

export function findClosest<S extends WithPosition, O extends WithPosition>(
	from: S,
	candidates: O[],
) {
	let closest: O | undefined;
	let minDist = Infinity;
	for (const item of candidates) {
		const dist = distance(from.position, item.position);
		if (dist < minDist) {
			minDist = dist;
			closest = item;
		}
	}
	return closest;
}

/**
 * @param from - who around is looking for
 * @param candidates - list of possible candidates
 * @param range - radius of the circle to look into
 *
 * @return candidate
 */
export function findClosestInRange<
	S extends WithPosition,
	O extends WithPosition,
>(from: S, candidates: O[], range: number) {
	const candidate = findClosest(from, candidates);
	if (candidate && distance(from.position, candidate.position) < range) {
		return candidate;
	}
}

export function findClosestPlayerInRange(
	enemy: EnemyState,
	weapon: WeaponState,
	players: BulbroState[],
): BulbroState | undefined {
	return findClosestInRange(
		enemy,
		players,
		weapon.statsBonus.range ?? minWeaponRange,
	);
}

/** Finds the closest enemy to a player based on Euclidean distance. */
export function findClosestEnemyInRange(
	player: BulbroState,
	weapon: WeaponState,
	enemies: EnemyState[],
): EnemyState | undefined {
	return findClosestInRange(
		player,
		enemies,
		(weapon.statsBonus.range ?? 0) + player.stats.range,
	);
}

export function shoot(
	player: BulbroState | EnemyState,
	shooterType: "player" | "enemy",
	weapon: WeaponState,
	targetPosition: Position,
): ShotState {
	const id = uuidv4();
	const weaponPosition = calculateWeaponPosition(
		weapon,
		player.weapons.findIndex((w) => w.id === weapon.id)!,
		player.weapons.length,
	);
	const currentPosition = addition(player.position, weaponPosition);
	const playerDamage = player.stats.damage ?? 0;
	const playerRange = player.stats.range ?? 0;
	const weaponDamage = weapon.statsBonus.damage ?? 0;
	const weaponRange = weapon.statsBonus.range ?? 0;
	const knockback = player.stats.knockback + (weapon.statsBonus.knockback ?? 0);
	return new ShotState({
		id,
		shooterType,
		shooterId: player.id,
		damage: playerDamage + weaponDamage,
		range: playerRange + weaponRange,
		position: currentPosition,
		startPosition: currentPosition,
		direction: direction(currentPosition, targetPosition),
		speed: weapon.shotSpeed,
		knockback,
	});
}

export function isInRange(
	player: BulbroState | EnemyState,
	enemy: EnemyState | BulbroState,
	weapon: WeaponState,
) {
	return (
		distance(player.position, enemy.position) <=
		(player.stats.range ?? 0) + (weapon.statsBonus.range ?? 0)
	);
}

export const getHpRegenerationPerSecond = (hpRegeneration: number) =>
	hpRegeneration / 11.25 + 1 / 9;

export const knockbackSpeed = 25;
export const knockbackTimeout = 200;

export function calculateWeaponPosition(
	weapon: WeaponState,
	index: number,
	totalWeapons: number,
) {
	// Calculate position around the bulbro character
	const radius = 28; // Distance from center
	const angleStep = (2 * Math.PI) / Math.max(totalWeapons, 1);
	const angle = angleStep * index;

	// Base position around the character
	const baseX = Math.cos(angle) * radius;
	const baseY = Math.sin(angle) * radius;

	// Apply aiming direction offset
	const aimingInfluence = 0.3; // How much the aiming direction affects position
	const aimingX = weapon.aimingDirection.x * aimingInfluence * radius;
	const aimingY = weapon.aimingDirection.y * aimingInfluence * radius;

	return { x: baseX + aimingX, y: baseY + aimingY };
}
