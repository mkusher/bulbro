import { v4 as uuidv4 } from "uuid";
import type {
	BulbroState,
	Stats,
} from "./bulbro";
import type { EnemyState } from "./enemy/EnemyState";
import {
	addition,
	type Direction,
	direction,
	distance,
	type Position,
	type Size,
} from "./geometry";
import { ShotState } from "./shot/ShotState";
import type { NowTime } from "./time";
import {
	getTimeLeft,
	type RoundState,
	type WaveState,
	type WeaponState,
} from "./waveState";
import { getWeaponSize } from "./weapon/sprites/WeaponSprite";

export const minWeaponRange = 25;

// Base stats for all Bulbros
export const baseStats: Stats =
	{
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
export type StatBonus =
	{
		[K in keyof Stats]?: number;
	};

// Define which stats use percentage bonuses vs absolute values
const percentageStats: Set<
	keyof Stats
> =
	new Set<
		keyof Stats
	>(
		[
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
		],
	);

// Helper function to calculate final stats from base stats and bonuses
export function calculateStats(
	bonuses: StatBonus,
): Stats {
	const finalStats =
		{
			...baseStats,
		};

	for (const [
		key,
		bonus,
	] of Object.entries(
		bonuses,
	)) {
		if (
			typeof bonus ===
			"number"
		) {
			const statKey =
				key as keyof Stats;
			const baseValue =
				baseStats[
					statKey
				];

			if (
				percentageStats.has(
					statKey,
				)
			) {
				finalStats[
					statKey
				] =
					baseValue *
					(1 +
						bonus /
							100);
			} else {
				finalStats[
					statKey
				] =
					baseValue +
					bonus;
			}
		}
	}

	return finalStats;
}

export type Difficulty =
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5;
export const isDifficulty =
	(
		maybeDifficulty: number,
	): maybeDifficulty is Difficulty =>
		maybeDifficulty >=
			0 &&
		maybeDifficulty <=
			5;

export const spawnIntervalForRound =
	(
		round: RoundState,
	) => {
		const wave =
			round.wave;
		const difficulty =
			round.difficulty +
			1;

		return (
			2000 /
			wave /
			difficulty
		);
	};
export const shouldSpawnEnemy =
	(
		now: NowTime,
		state: WaveState,
	) => {
		const spawnInterval =
			spawnIntervalForRound(
				state.round,
			);
		const timeSinceLastSpawn =
			now -
			(state.lastSpawnAt ??
				0);
		const timeLeftInRound =
			getTimeLeft(
				state.round,
			);
		const timeModifier =
			(1 -
				timeLeftInRound /
					state
						.round
						.duration /
					1000) *
			timeSinceLastSpawn;
		return (
			((timeSinceLastSpawn +
				timeModifier) /
				spawnInterval) *
				Math.random() >=
			1
		);
	};
/**
 * Calculates the attack cooldown in milliseconds.
 * @param weaponTime - base time between attacks in seconds (from weapon.statsBonus.attackSpeed)
 * @param entityAttackSpeed - percentage improvement from entity stats (0 = no improvement, 50 = 50% faster)
 * @returns cooldown in milliseconds, minimum 100ms
 */
export function getAttackCooldown(
	weaponTime: number,
	entityAttackSpeed: number,
): number {
	const improvement =
		Math.min(
			entityAttackSpeed,
			90,
		);
	const cooldownMs =
		weaponTime *
		1000 *
		(1 -
			improvement /
				100);
	return Math.max(
		100,
		cooldownMs,
	);
}

/**
 * Determines if a weapon is ready to shoot.
 * @param lastStrikedAt - timestamp of last attack
 * @param weaponTime - base time between attacks in seconds (from weapon)
 * @param entityAttackSpeed - percentage improvement from entity stats
 * @param now - current time
 */
export function isWeaponReadyToShoot(
	lastStrikedAt: number,
	weaponTime: number,
	entityAttackSpeed: number,
	now: NowTime,
): boolean {
	const elapsed =
		now -
		lastStrikedAt;
	const cooldown =
		getAttackCooldown(
			weaponTime,
			entityAttackSpeed,
		);
	return (
		elapsed >=
		cooldown
	);
}

export type WithPosition =
	{
		position: Position;
	};

export function findClosest<
	S extends
		WithPosition,
	O extends
		WithPosition,
>(
	from: S,
	candidates: O[],
) {
	let closest:
		| O
		| undefined;
	let minDist =
		Infinity;
	for (const item of candidates) {
		const dist =
			distance(
				from.position,
				item.position,
			);
		if (
			dist <
			minDist
		) {
			minDist =
				dist;
			closest =
				item;
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
	S extends
		WithPosition,
	O extends
		WithPosition,
>(
	from: S,
	candidates: O[],
	range: number,
) {
	const candidate =
		findClosest(
			from,
			candidates,
		);
	if (
		candidate &&
		distance(
			from.position,
			candidate.position,
		) <
			range
	) {
		return candidate;
	}
}

export function findClosestPlayerInRange(
	enemy: EnemyState,
	weapon: WeaponState,
	players: BulbroState[],
):
	| BulbroState
	| undefined {
	return findClosestInRange(
		enemy,
		players,
		weapon
			.statsBonus
			.range ??
			minWeaponRange,
	);
}

/** Finds the closest enemy to a player based on Euclidean distance. */
export function findClosestEnemyInRange(
	player: BulbroState,
	weapon: WeaponState,
	enemies: EnemyState[],
):
	| EnemyState
	| undefined {
	return findClosestInRange(
		player,
		enemies,
		(weapon
			.statsBonus
			.range ??
			0) +
			player
				.stats
				.range,
	);
}

export function shoot(
	player:
		| BulbroState
		| EnemyState,
	shooterType:
		| "player"
		| "enemy",
	weapon: WeaponState,
	targetPosition: Position,
): ShotState {
	const id =
		uuidv4();
	const weaponIndex =
		player.weapons.findIndex(
			(
				w,
			) =>
				w.id ===
				weapon.id,
		);
	// Use world offset that accounts for facing direction
	const facingDirection =
		player.lastDirection ?? {
			x: 1,
			y: 0,
		};

	// Calculate weapon visual center in world (including aiming influence).
	// This matches where the weapon sprite actually renders.
	const weaponVisualOffset =
		calculateWeaponVisualWorldOffset(
			weapon,
			weaponIndex,
			player
				.weapons
				.length,
			facingDirection,
		);
	const weaponVisualPosition =
		addition(
			player.position,
			weaponVisualOffset,
		);

	// Calculate shot start position at the weapon's end (barrel tip)
	// Use weapon width (length along aim direction) / 2 from visual center
	const weaponSize =
		getWeaponSize(
			weapon.type,
		);
	const barrelPosition =
		calculateBarrelTipOffset(
			weaponVisualPosition,
			weapon.aimingDirection,
			weaponSize,
		);

	const shotDirection =
		direction(
			barrelPosition,
			targetPosition,
		);
	const playerDamage =
		player
			.stats
			.damage ??
		0;
	const playerRange =
		player
			.stats
			.range ??
		0;
	const weaponDamage =
		weapon
			.statsBonus
			.damage ??
		0;
	const weaponRange =
		weapon
			.statsBonus
			.range ??
		0;
	const knockback =
		player
			.stats
			.knockback +
		(weapon
			.statsBonus
			.knockback ??
			0);
	return new ShotState(
		{
			id,
			shooterType,
			shooterId:
				player.id,
			damage:
				playerDamage +
				weaponDamage,
			range:
				playerRange +
				weaponRange,
			position:
				barrelPosition,
			startPosition:
				barrelPosition,
			direction:
				shotDirection,
			speed:
				weapon.shotSpeed,
			knockback,
			weaponType:
				weapon.type,
		},
	);
}

export function isInRange(
	player:
		| BulbroState
		| EnemyState,
	enemy:
		| EnemyState
		| BulbroState,
	weapon: WeaponState,
) {
	return (
		distance(
			player.position,
			enemy.position,
		) <=
		(player
			.stats
			.range ??
			0) +
			(weapon
				.statsBonus
				.range ??
				0)
	);
}

export const getHpRegenerationPerSecond =
	(
		hpRegeneration: number,
	) =>
		hpRegeneration /
			11.25 +
		1 /
			9;

export const knockbackSpeed = 25;
export const knockbackTimeout = 200;

// Visual offset applied to weapons container relative to bulbro sprite center
// This must match the offset in WeaponsSprite.appendTo()
export const weaponContainerOffset =
	{
		x: 12,
		y: 16,
	};

// Shared constants for weapon positioning
const weaponOrbitRadius = 32;
const aimingInfluence = 0.3;

/**
 * Calculates the base orbital position for a weapon around the character.
 */
function getWeaponOrbitalPosition(
	index: number,
	totalWeapons: number,
) {
	const angleStep =
		(2 *
			Math.PI) /
		Math.max(
			totalWeapons,
			1,
		);
	const angle =
		angleStep *
		index;

	return {
		x:
			Math.cos(
				angle,
			) *
			weaponOrbitRadius,
		y:
			Math.sin(
				angle,
			) *
			weaponOrbitRadius,
	};
}

/**
 * Calculates weapon's position relative to the weapons container.
 * Used by sprites for visual positioning within the container.
 * Includes aiming influence offset for visual feedback.
 */
export function calculateWeaponPosition(
	weapon: WeaponState,
	index: number,
	totalWeapons: number,
) {
	const base =
		getWeaponOrbitalPosition(
			index,
			totalWeapons,
		);

	// Apply aiming direction offset for visual feedback
	const aimingX =
		weapon
			.aimingDirection
			.x *
		aimingInfluence *
		weaponOrbitRadius;
	const aimingY =
		weapon
			.aimingDirection
			.y *
		aimingInfluence *
		weaponOrbitRadius;

	return {
		x:
			base.x +
			aimingX,
		y:
			base.y +
			aimingY,
	};
}

/**
 * Calculates weapon's world position offset relative to bulbro's position.
 * Used for spawning bullets and calculating aim direction.
 * Accounts for the weapons container offset and the bulbro's facing direction.
 */
export function calculateWeaponWorldOffset(
	index: number,
	totalWeapons: number,
	facingDirection: Direction,
) {
	const base =
		getWeaponOrbitalPosition(
			index,
			totalWeapons,
		);

	// When bulbro faces left (scale.x = -1), the visual x position is flipped
	const directionMultiplier =
		facingDirection.x <
		0
			? -1
			: 1;

	return {
		x:
			(base.x +
				weaponContainerOffset.x) *
			directionMultiplier,
		y:
			base.y +
			weaponContainerOffset.y,
	};
}

// Weapon sprite scaling factor (must match WeaponsSprite)
const weaponSpriteScale = 0.125;

/**
 * Calculates weapon's visual world position offset relative to bulbro's position.
 * Matches the rendering pipeline: orbital + aiming influence + container offset,
 * with x flipped when facing left.
 */
export function calculateWeaponVisualWorldOffset(
	weapon: WeaponState,
	index: number,
	totalWeapons: number,
	facingDirection: Direction,
) {
	const localPos =
		calculateWeaponPosition(
			weapon,
			index,
			totalWeapons,
		);

	const directionMultiplier =
		facingDirection.x <
		0
			? -1
			: 1;

	return {
		x:
			(localPos.x +
				weaponContainerOffset.x) *
			directionMultiplier,
		y:
			localPos.y +
			weaponContainerOffset.y,
	};
}

/**
 * Calculates the barrel tip (weapon end) position in world coordinates.
 * The shot spawns at the weapon's visual center + width/2 along the
 * aiming direction, matching where the weapon sprite's right edge is.
 */
export function calculateBarrelTipOffset(
	weaponVisualOffset: Position,
	aimingDirection: Direction,
	weaponSize: Size,
) {
	return weaponVisualOffset;
	// If not aiming, just return weapon visual center
	if (
		aimingDirection.x ===
			0 &&
		aimingDirection.y ===
			0
	) {
		return weaponVisualOffset;
	}

	// The weapon sprite is anchored at center (0.5, 0.5).
	// The "barrel tip" is at width/2 from center along the aiming direction.
	// Apply weapon sprite scaling to convert from texture pixels to world units.
	const tipDistance =
		(weaponSize.width /
			2) *
		weaponSpriteScale;

	return {
		x:
			weaponVisualOffset.x +
			aimingDirection.x *
				tipDistance,
		y:
			weaponVisualOffset.y +
			aimingDirection.y *
				tipDistance,
	};
}
