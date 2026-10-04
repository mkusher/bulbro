import type { MainStats } from "@/bulbro/BulbroCharacter";
import type { StatBonus } from "@/game-formulas";
import { seededRng } from "@/random";

/** Upgrade tiers I–IV, as in Brotato. */
export type UpgradeTier =
	| 1
	| 2
	| 3
	| 4;

export const upgradeTiers: UpgradeTier[] =
	[
		1,
		2,
		3,
		4,
	];

/** A level-up upgrade: raises one primary stat by a tier dependent amount. */
export type UpgradeDefinition =
	{
		id: string;
		/** Brotato name of the upgrade, e.g. "Heart" */
		name: string;
		stat: keyof MainStats;
		/** Stat points for tiers I, II, III and IV */
		values: Record<
			UpgradeTier,
			number
		>;
	};

/**
 * Brotato level-up upgrades. Engineering (Skull) is left out until
 * structures exist.
 */
export const upgradeDefinitions: UpgradeDefinition[] =
	[
		{
			id: "heart",
			name: "Heart",
			stat: "maxHp",
			values:
				{
					1: 3,
					2: 6,
					3: 9,
					4: 12,
				},
		},
		{
			id: "lungs",
			name: "Lungs",
			stat: "hpRegeneration",
			values:
				{
					1: 2,
					2: 3,
					3: 4,
					4: 5,
				},
		},
		{
			id: "teeth",
			name: "Teeth",
			stat: "lifeSteal",
			values:
				{
					1: 1,
					2: 2,
					3: 3,
					4: 4,
				},
		},
		{
			id: "triceps",
			name: "Triceps",
			stat: "damage",
			values:
				{
					1: 5,
					2: 8,
					3: 12,
					4: 16,
				},
		},
		{
			id: "forearms",
			name: "Forearms",
			stat: "meleeDamage",
			values:
				{
					1: 2,
					2: 4,
					3: 6,
					4: 8,
				},
		},
		{
			id: "shoulders",
			name: "Shoulders",
			stat: "rangedDamage",
			values:
				{
					1: 1,
					2: 2,
					3: 3,
					4: 4,
				},
		},
		{
			id: "brain",
			name: "Brain",
			stat: "elementalDamage",
			values:
				{
					1: 1,
					2: 2,
					3: 3,
					4: 4,
				},
		},
		{
			id: "reflexes",
			name: "Reflexes",
			stat: "attackSpeed",
			values:
				{
					1: 5,
					2: 10,
					3: 15,
					4: 20,
				},
		},
		{
			id: "fingers",
			name: "Fingers",
			stat: "critChance",
			values:
				{
					1: 3,
					2: 5,
					3: 7,
					4: 9,
				},
		},
		{
			id: "eyes",
			name: "Eyes",
			stat: "range",
			values:
				{
					1: 15,
					2: 30,
					3: 45,
					4: 60,
				},
		},
		{
			id: "chest",
			name: "Chest",
			stat: "armor",
			values:
				{
					1: 1,
					2: 2,
					3: 3,
					4: 4,
				},
		},
		{
			id: "back",
			name: "Back",
			stat: "dodge",
			values:
				{
					1: 3,
					2: 6,
					3: 9,
					4: 12,
				},
		},
		{
			id: "legs",
			name: "Legs",
			stat: "speed",
			values:
				{
					1: 3,
					2: 6,
					3: 9,
					4: 12,
				},
		},
		{
			id: "nose",
			name: "Nose",
			stat: "luck",
			values:
				{
					1: 5,
					2: 10,
					3: 15,
					4: 20,
				},
		},
		{
			id: "hands",
			name: "Hands",
			stat: "harvesting",
			values:
				{
					1: 5,
					2: 8,
					3: 10,
					4: 12,
				},
		},
	];

export function findUpgradeById(
	id: string,
):
	| UpgradeDefinition
	| undefined {
	return upgradeDefinitions.find(
		(
			upgrade,
		) =>
			upgrade.id ===
			id,
	);
}

/** An upgrade offered on the level-up screen. */
export type UpgradeChoice =
	{
		upgrade: UpgradeDefinition;
		tier: UpgradeTier;
	};

export function upgradeBonuses(
	upgrade: UpgradeDefinition,
	tier: UpgradeTier,
): StatBonus {
	return {
		[upgrade.stat]:
			upgrade
				.values[
				tier
			],
	};
}

/** Number of upgrades offered for every level gained. */
export const upgradeChoicesCount = 4;

/** Stat source id of the upgrade picked for `level`. */
export function levelUpgradeStatSourceId(
	level: number,
) {
	return `level-up-${level}`;
}

/**
 * Levels that offer only upgrades of one tier (Brotato): level 1 → I,
 * level 5 → II, levels 10, 15 and 20 → III, level 25 and every 5th level
 * after → IV.
 */
export function guaranteedUpgradeTier(
	level: number,
):
	| UpgradeTier
	| undefined {
	if (
		level ===
		1
	)
		return 1;
	if (
		level ===
		5
	)
		return 2;
	if (
		level ===
			10 ||
		level ===
			15 ||
		level ===
			20
	)
		return 3;
	if (
		level >=
			25 &&
		level %
			5 ===
			0
	)
		return 4;
	return undefined;
}

/** Chance of an upgrade tier: grows with the level, scaled by luck, capped. */
type TierChance =
	{
		tier: UpgradeTier;
		fromLevel: number;
		perLevel: number;
		max: number;
	};

/** Highest tier first; the first successful roll wins. */
const tierChances: TierChance[] =
	[
		{
			tier: 4,
			fromLevel: 6,
			perLevel: 0.0023,
			max: 0.08,
		},
		{
			tier: 3,
			fromLevel: 2,
			perLevel: 0.02,
			max: 0.25,
		},
		{
			tier: 2,
			fromLevel: 0,
			perLevel: 0.06,
			max: 0.6,
		},
	];

/** Chance of rolling exactly at least `tier` (before higher tiers are rolled). */
export function upgradeTierChance(
	tier: UpgradeTier,
	level: number,
	luck: number,
) {
	const chance =
		tierChances.find(
			(
				c,
			) =>
				c.tier ===
				tier,
		);
	if (
		!chance
	)
		return 1;
	const luckFactor =
		Math.max(
			0,
			1 +
				luck /
					100,
		);
	return Math.min(
		chance.max,
		Math.max(
			0,
			(level -
				chance.fromLevel) *
				chance.perLevel,
		) *
			luckFactor,
	);
}

/** Rolls an upgrade tier for `level`; luck raises the chance of higher tiers. */
export function rollUpgradeTier(
	level: number,
	luck: number,
	random: () => number = Math.random,
): UpgradeTier {
	const guaranteed =
		guaranteedUpgradeTier(
			level,
		);
	if (
		guaranteed
	)
		return guaranteed;
	for (const {
		tier,
	} of tierChances) {
		if (
			random() <
			upgradeTierChance(
				tier,
				level,
				luck,
			)
		)
			return tier;
	}
	return 1;
}

/** Stable 32-bit hash of a string (FNV-1a). */
function hashString(
	value: string,
) {
	let hash = 0x811c9dc5;
	for (
		let i = 0;
		i <
		value.length;
		i++
	) {
		hash ^=
			value.charCodeAt(
				i,
			);
		hash =
			Math.imul(
				hash,
				0x01000193,
			);
	}
	return (
		hash >>>
		0
	);
}

export type GenerateUpgradeChoicesOptions =
	{
		playerId: string;
		/** Level the upgrade is chosen for */
		level: number;
		luck: number;
		/** Re-rolls done for the level; every re-roll offers new choices */
		rerollCount?: number;
		count?: number;
	};

/**
 * Picks distinct random upgrades for a level. Choices are seeded by the
 * player, the level and the re-roll count, so they stay the same while the
 * screen re-renders.
 */
export function generateUpgradeChoices({
	playerId,
	level,
	luck,
	rerollCount = 0,
	count = upgradeChoicesCount,
}: GenerateUpgradeChoicesOptions): UpgradeChoice[] {
	const random =
		seededRng(
			hashString(
				`${playerId}:${level}:${rerollCount}`,
			),
		);
	const pool =
		[
			...upgradeDefinitions,
		];
	const choices: UpgradeChoice[] =
		[];
	while (
		choices.length <
			count &&
		pool.length >
			0
	) {
		const [
			upgrade,
		] =
			pool.splice(
				Math.floor(
					random() *
						pool.length,
				),
				1,
			);
		choices.push(
			{
				upgrade:
					upgrade!,
				tier: rollUpgradeTier(
					level,
					luck,
					random,
				),
			},
		);
	}
	return choices;
}
