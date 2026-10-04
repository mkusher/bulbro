import { baseWeaponStats } from "@bulbro/network-protocol";
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
import {
	isExplosiveWeapon,
	isMeleeWeapon,
} from "./weapon";
import { getWeaponSize } from "./weapon/sprites/WeaponSprite";
import type { DamageScalingStat } from "./weapon/WeaponState";

export const minWeaponRange = 25;

// Base stats for all Bulbros
export const baseStats: Stats =
	{
		...baseWeaponStats,
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
		explosionSize: 0,
	};

// Stat bonus types - plain numeric stat points
export type StatBonus =
	{
		[K in keyof Stats]?: number;
	};

/**
 * Stats whose points are a percentage of the base value
 * (e.g. speed: 450 × (1 + points / 100)). Every other stat is a plain
 * sum of points on top of its base value, and the combat formulas give the
 * points their meaning (e.g. damage: +points% damage).
 */
const percentOfBaseStats =
	new Set<
		keyof Stats
	>(
		[
			"speed",
			"pickupRange",
		],
	);

/** Stats whose points are displayed as percentages. */
export const percentageStats =
	new Set<
		keyof Stats
	>(
		[
			"speed",
			"damage",
			"attackSpeed",
			"critChance",
			"lifeSteal",
			"dodge",
			"luck",
			"pickupRange",
			"explosionSize",
		],
	);

/** Where a Bulbro's stat points come from. */
export type StatSourceKind =
	| "character"
	| "harvestingGrowth"
	| "upgrade"
	| "item"
	| "level";

export type StatSource =
	{
		/** Unique within a Bulbro: a source with the same id replaces the previous one */
		id: string;
		kind: StatSourceKind;
		bonuses: StatBonus;
	};

export const minMaxHp = 1;

/** Sums stat points of all the sources and applies them to the base stats. */
export function computeStats(
	sources: StatSource[],
): Stats {
	const points: StatBonus =
		{};
	for (const source of sources) {
		for (const [
			key,
			bonus,
		] of Object.entries(
			source.bonuses,
		)) {
			if (
				typeof bonus !==
				"number"
			)
				continue;
			const statKey =
				key as keyof Stats;
			points[
				statKey
			] =
				(points[
					statKey
				] ??
					0) +
				bonus;
		}
	}

	const finalStats =
		{
			...baseStats,
		};
	for (const [
		key,
		bonus,
	] of Object.entries(
		points,
	)) {
		const statKey =
			key as keyof Stats;
		const baseValue =
			baseStats[
				statKey
			];
		finalStats[
			statKey
		] =
			percentOfBaseStats.has(
				statKey,
			)
				? baseValue *
					(1 +
						bonus /
							100)
				: baseValue +
					bonus;
	}
	finalStats.maxHp =
		Math.max(
			minMaxHp,
			finalStats.maxHp,
		);

	return finalStats;
}

/** Calculates stats from a single set of bonuses (e.g. a character's). */
export function calculateStats(
	bonuses: StatBonus,
): Stats {
	return computeStats(
		[
			{
				id: "bonuses",
				kind: "character",
				bonuses,
			},
		],
	);
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
 * Positive attack speed divides the cooldown (+100 attacks twice as often),
 * negative attack speed multiplies it (-50 makes attacks 1.5× slower).
 * @param weaponCooldown - base time between attacks in seconds (from weapon.statsBonus.cooldown)
 * @param attackSpeed - attack speed points of the attacker
 * @returns cooldown in milliseconds, minimum 100ms
 */
export function getAttackCooldown(
	weaponCooldown: number,
	attackSpeed: number,
): number {
	const baseCooldownMs =
		weaponCooldown *
		1000;
	const cooldownMs =
		attackSpeed >=
		0
			? baseCooldownMs /
				(1 +
					attackSpeed /
						100)
			: baseCooldownMs *
				(1 -
					attackSpeed /
						100);
	return Math.max(
		100,
		cooldownMs,
	);
}

/**
 * Determines if a weapon is ready to shoot.
 * @param lastStrikedAt - timestamp of last attack
 * @param weaponCooldown - base time between attacks in seconds (from weapon)
 * @param attackSpeed - attack speed points of the attacker
 * @param now - current time
 */
export function isWeaponReadyToShoot(
	lastStrikedAt: number,
	weaponCooldown: number,
	attackSpeed: number,
	now: NowTime,
): boolean {
	const elapsed =
		now -
		lastStrikedAt;
	const cooldown =
		getAttackCooldown(
			weaponCooldown,
			attackSpeed,
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
		(weapon
			.statsBonus
			.range ??
			minWeaponRange) +
			enemy
				.stats
				.range,
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
		calculateAttackRange(
			player,
			weapon,
			"player",
		),
	);
}

export type AttackerType =
	| "player"
	| "enemy";

type Attacker =
	{
		stats: Pick<
			Stats,
			| "damage"
			| "meleeDamage"
			| "rangedDamage"
			| "elementalDamage"
			| "critChance"
			| "range"
			| "knockback"
		>;
	};

export const defaultCritMultiplier = 2;
/** Share of the range stat melee weapons get */
export const meleeRangeStatFactor = 0.5;

/** How much of each damage stat is added to the weapon's damage. */
export function getWeaponScaling(
	weapon: WeaponState,
): Partial<
	Record<
		DamageScalingStat,
		number
	>
> {
	return (
		weapon
			.statsBonus
			.scaling ??
		(isMeleeWeapon(
			weapon.type,
		)
			? {
					meleeDamage: 1,
				}
			: {
					rangedDamage: 1,
				})
	);
}

/**
 * Damage of a single attack (shot or melee strike) made with the weapon.
 *
 * Players: (weapon damage + scaled melee/ranged/elemental damage) × (1 + damage%),
 * then a crit roll (player's + weapon's crit chance) multiplies it by the weapon's
 * crit multiplier. Result is rounded, at least 1 when the weapon deals damage.
 *
 * Enemies deal their flat damage stat plus the weapon's damage.
 */
export function calculateAttackDamage(
	attacker: Attacker,
	weapon: WeaponState,
	attackerType: AttackerType,
	random: () => number = Math.random,
) {
	const weaponStats =
		weapon.statsBonus;
	if (
		attackerType ===
		"enemy"
	) {
		return (
			(attacker
				.stats
				.damage ??
				0) +
			(weaponStats.damage ??
				0)
		);
	}

	const scaling =
		getWeaponScaling(
			weapon,
		);
	let baseDamage =
		weaponStats.damage ??
		0;
	for (const [
		stat,
		share,
	] of Object.entries(
		scaling,
	) as [
		DamageScalingStat,
		number,
	][]) {
		baseDamage +=
			(attacker
				.stats[
				stat
			] ??
				0) *
			share;
	}
	if (
		baseDamage <=
		0
	)
		return 0;

	const multiplied =
		baseDamage *
		Math.max(
			0,
			1 +
				(attacker
					.stats
					.damage ??
					0) /
					100,
		);
	const critChance =
		(attacker
			.stats
			.critChance ??
			0) +
		(weaponStats.critChance ??
			0);
	const isCritical =
		random() *
			100 <
		critChance;
	const damage =
		isCritical
			? multiplied *
				(weaponStats.critMultiplier ??
					defaultCritMultiplier)
			: multiplied;
	return Math.max(
		1,
		Math.round(
			damage,
		),
	);
}

/**
 * Maximum distance an attack made with the weapon reaches.
 * Players' melee weapons get only half of the range stat.
 */
export function calculateAttackRange(
	attacker: {
		stats: Pick<
			Stats,
			"range"
		>;
	},
	weapon: WeaponState,
	attackerType: AttackerType,
) {
	const rangeStat =
		attacker
			.stats
			.range ??
		0;
	const rangeFromStats =
		attackerType ===
			"player" &&
		isMeleeWeapon(
			weapon.type,
		)
			? rangeStat *
				meleeRangeStatFactor
			: rangeStat;
	return (
		rangeFromStats +
		(weapon
			.statsBonus
			.range ??
			0)
	);
}

/** Knockback strength of an attack made with the weapon. */
export function calculateAttackKnockback(
	attacker: Attacker,
	weapon: WeaponState,
) {
	return (
		(attacker
			.stats
			.knockback ??
			0) +
		(weapon
			.statsBonus
			.knockback ??
			0)
	);
}

/** Smallest explosion radius, whatever the explosion size stat. */
export const minExplosionRadius = 10;

/**
 * Radius of the explosion of the weapon's projectiles:
 * weapon explosion radius × (1 + explosion size%). Enemies have no explosion
 * size stat. Weapons without an "explosion" attack don't explode (0).
 */
export function calculateExplosionRadius(
	attacker: {
		/** Players' stats, or enemies' stats which have no explosion size */
		stats: object;
	},
	weapon: WeaponState,
	attackerType: AttackerType,
) {
	if (
		!isExplosiveWeapon(
			weapon.type,
		)
	)
		return 0;
	const radius =
		weapon
			.statsBonus
			.explosionRadius ??
		0;
	const explosionSize =
		attackerType ===
			"player" &&
		"explosionSize" in
			attacker.stats &&
		typeof attacker
			.stats
			.explosionSize ===
			"number"
			? attacker
					.stats
					.explosionSize
			: 0;
	return Math.max(
		minExplosionRadius,
		radius *
			(1 +
				explosionSize /
					100),
	);
}

export function shoot(
	player:
		| BulbroState
		| EnemyState,
	shooterType: AttackerType,
	weapon: WeaponState,
	targetPosition: Position,
	random: () => number = Math.random,
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
	const lastHorizontalDirection =
		player.lastHorizontalDirection;

	// Calculate weapon visual center in world (including aiming influence).
	// This matches where the weapon sprite actually renders.
	const weaponVisualOffset =
		calculateWeaponVisualWorldOffset(
			weapon,
			weaponIndex,
			player
				.weapons
				.length,
			lastHorizontalDirection,
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
	return new ShotState(
		{
			id,
			shooterType,
			shooterId:
				player.id,
			damage:
				calculateAttackDamage(
					player,
					weapon,
					shooterType,
					random,
				),
			range:
				calculateAttackRange(
					player,
					weapon,
					shooterType,
				),
			position:
				barrelPosition,
			startPosition:
				barrelPosition,
			direction:
				shotDirection,
			speed:
				weapon.shotSpeed,
			knockback:
				calculateAttackKnockback(
					player,
					weapon,
				),
			weaponType:
				weapon.type,
			explosionRadius:
				calculateExplosionRadius(
					player,
					weapon,
					shooterType,
				),
		},
	);
}

export function isInRange(
	attacker:
		| BulbroState
		| EnemyState,
	target:
		| EnemyState
		| BulbroState,
	weapon: WeaponState,
	attackerType: AttackerType,
) {
	return (
		distance(
			attacker.position,
			target.position,
		) <=
		calculateAttackRange(
			attacker,
			weapon,
			attackerType,
		)
	);
}

/**
 * HP healed per second by HP regeneration points.
 * Brotato: 1 HP every 5 / (1 + (R - 1) / 2.25) seconds; no regeneration at R <= 0.
 */
export const getHpRegenerationPerSecond =
	(
		hpRegeneration: number,
	) =>
		hpRegeneration <=
		0
			? 0
			: (1 +
					(hpRegeneration -
						1) /
						2.25) /
				5;

/** Armor points needed to halve the damage taken */
export const armorConstant = 15;

/**
 * Damage left after armor. Positive armor reduces the damage
 * (× 15 / (15 + armor)), negative armor increases it (× (15 - armor) / 15).
 * A hit always deals at least 1 damage.
 */
export function damageAfterArmor(
	damage: number,
	armor: number,
) {
	if (
		damage <=
		0
	)
		return 0;
	const multiplier =
		armor >=
		0
			? armorConstant /
				(armorConstant +
					armor)
			: (armorConstant -
					armor) /
				armorConstant;
	return Math.max(
		1,
		Math.round(
			damage *
				multiplier,
		),
	);
}

/** Dodge chance is capped at 60% */
export const maxDodge = 60;

/** Probability (0..1) to dodge a hit. */
export function getDodgeChance(
	dodge: number,
) {
	return (
		Math.min(
			Math.max(
				dodge,
				0,
			),
			maxDodge,
		) /
		100
	);
}

/** Life steal heals at most 10 times per second */
export const lifeStealCooldown = 100;
/** HP healed by a single life steal */
export const lifeStealHeal = 1;

/** Probability (0..1) to heal on a hit. */
export function getLifeStealChance(
	lifeSteal: number,
) {
	return (
		Math.min(
			Math.max(
				lifeSteal,
				0,
			),
			100,
		) /
		100
	);
}

/** Luck scales drop chances: +100 luck doubles them, -100 luck removes them. */
export function dropChanceWithLuck(
	chance: number,
	luck: number,
) {
	return Math.min(
		1,
		Math.max(
			0,
			chance *
				(1 +
					luck /
						100),
		),
	);
}

/** Harvesting grows by 5% at the end of every wave */
export const harvestingGrowthPerWave = 0.05;

export const knockbackSpeed = 25;
export const knockbackTimeout = 200;

const bulbroBodySize =
	{
		width: 100,
		height: 130,
	};
const bulbroCharacterScaling = 0.25;

// Offset of the weapons container relative to bulbro origin.
// Must match BulbaSprite weaponsContainer positioning.
const weaponsContainerPosition =
	{
		x:
			-(
				bulbroBodySize.width *
				bulbroCharacterScaling
			) /
			2,
		y:
			-(
				bulbroBodySize.height *
				bulbroCharacterScaling
			) -
			15,
	};

// Orbit center offset inside the weapons container (body center).
export const weaponContainerOffset =
	{
		x:
			(bulbroBodySize.width *
				bulbroCharacterScaling) /
			2,
		y:
			(bulbroBodySize.height *
				bulbroCharacterScaling) /
			2,
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
 * Calculates weapon's position relative to the bulbro sprite center.
 * Used by sprites for visual positioning and includes container offset.
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
			aimingX +
			weaponContainerOffset.x,
		y:
			base.y +
			aimingY +
			weaponContainerOffset.y,
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
	lastHorizontalDirection: number,
) {
	const base =
		getWeaponOrbitalPosition(
			index,
			totalWeapons,
		);

	// When bulbro faces left (scale.x = -1), the visual x position is flipped
	const directionMultiplier =
		lastHorizontalDirection <
		0
			? -1
			: 1;

	return {
		x:
			(base.x +
				weaponContainerOffset.x +
				weaponsContainerPosition.x) *
			directionMultiplier,
		y:
			base.y +
			weaponContainerOffset.y +
			weaponsContainerPosition.y,
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
	lastHorizontalDirection: number,
) {
	const localPos =
		calculateWeaponPosition(
			weapon,
			index,
			totalWeapons,
		);

	const directionMultiplier =
		lastHorizontalDirection <
		0
			? -1
			: 1;

	return {
		x:
			(localPos.x +
				weaponsContainerPosition.x) *
			directionMultiplier,
		y:
			localPos.y +
			weaponsContainerPosition.y,
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

export function rerollIncrease(
	waveNumber: number,
) {
	return Math.max(
		1,
		Math.floor(
			0.4 *
				waveNumber,
		),
	);
}

export function firstRerollPrice(
	waveNumber: number,
) {
	return (
		Math.floor(
			waveNumber *
				0.75,
		) +
		rerollIncrease(
			waveNumber,
		)
	);
}

/** Price of the next re-roll after `rerollCount` re-rolls in the wave. */
export function rerollPrice(
	rerollCount: number,
	waveNumber: number,
) {
	return (
		firstRerollPrice(
			waveNumber,
		) +
		rerollCount *
			rerollIncrease(
				waveNumber,
			)
	);
}

export function itemPrice(
	basePrice: number,
	waveNumber: number,
	inflation: number,
) {
	return Math.floor(
		(basePrice +
			waveNumber +
			basePrice *
				waveNumber *
				0.1) *
			inflation,
	);
}
