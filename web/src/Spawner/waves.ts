import type { EnemyCharacter } from "@/enemy";
import type { Range } from "@/geometry";
import { requireDefined } from "@/requireDefined";
import {
	aphidEnemy,
	babyEnemy,
	badger,
	beetleArcher,
	beetleWarrior,
	coloradoBeetle,
	hedghehog,
	roach,
	wildBoar,
} from "../enemies-definitions";
import {
	longRange,
	mediumRange,
	shortRange,
} from "./spawnRanges";
import type {
	AmountRange,
	SpawnGroup,
	WaveDefinition,
} from "./WaveConfig";

const narrow =
	Math.PI /
	4;
const wide =
	Math.PI /
	2;

type GroupFactory =
	(
		firstSpawn: number,
		interval: number,
		amount: AmountRange,
		spawnRange: Range,
		lastSpawn?: number,
	) => SpawnGroup;

function formation(
	enemy: EnemyCharacter,
	spread: number,
	mirrored: boolean,
): GroupFactory {
	return (
		firstSpawn,
		interval,
		amount,
		spawnRange,
		lastSpawn,
	) => ({
		enemy,
		firstSpawn,
		interval,
		lastSpawn,
		amount,
		spawnRange,
		spread,
		mirrored,
	});
}

// Swarming enemies come from two opposite sides at once
const baby =
	formation(
		babyEnemy,
		narrow,
		true,
	);
const colorado =
	formation(
		coloradoBeetle,
		narrow,
		true,
	);
const aphid =
	formation(
		aphidEnemy,
		narrow,
		true,
	);
const warrior =
	formation(
		beetleWarrior,
		narrow,
		false,
	);
const archer =
	formation(
		beetleArcher,
		narrow,
		false,
	);
const boar =
	formation(
		wildBoar,
		wide,
		false,
	);
const roaches =
	formation(
		roach,
		wide,
		false,
	);
const hedgehog =
	formation(
		hedghehog,
		wide,
		false,
	);
const badgers =
	formation(
		badger,
		wide,
		false,
	);

/**
 * Hand-made waves; index 0 is wave 1.
 *
 * Waves 1–12 introduce one enemy at a time. Waves 13–19 follow the themes
 * of Brotato's waves 13–19 with Bulbro's roster, wave 20 is a horde,
 * waves 21–30 mix the late roster with growing density and hordes
 * on waves 25 and 30.
 */
export const waves: WaveDefinition[] =
	[
		// 1
		[
			baby(
				1,
				3,
				[
					4,
					5,
				],
				shortRange,
			),
		],
		// 2
		[
			baby(
				10,
				5,
				[
					4,
					5,
				],
				longRange,
			),
			colorado(
				1,
				3,
				[
					3,
					4,
				],
				shortRange,
			),
		],
		// 3
		[
			baby(
				1,
				3,
				[
					5,
					6,
				],
				longRange,
			),
			colorado(
				10,
				6,
				[
					3,
					4,
				],
				shortRange,
			),
		],
		// 4
		[
			baby(
				4,
				3,
				[
					6,
					7,
				],
				shortRange,
			),
			aphid(
				1,
				5,
				[
					2,
					2,
				],
				mediumRange,
			),
		],
		// 5
		[
			baby(
				1,
				3,
				[
					8,
					8,
				],
				longRange,
			),
			colorado(
				3,
				5,
				[
					3,
					4,
				],
				shortRange,
			),
			aphid(
				25,
				6,
				[
					1,
					2,
				],
				mediumRange,
			),
		],
		// 6
		[
			baby(
				20,
				4,
				[
					5,
					6,
				],
				shortRange,
			),
			colorado(
				3,
				3,
				[
					3,
					4,
				],
				shortRange,
			),
			warrior(
				4,
				3,
				[
					4,
					5,
				],
				longRange,
			),
			boar(
				10,
				10,
				[
					1,
					2,
				],
				mediumRange,
			),
		],
		// 7
		[
			baby(
				4,
				3,
				[
					6,
					7,
				],
				longRange,
			),
			warrior(
				10,
				5,
				[
					6,
					6,
				],
				longRange,
			),
			aphid(
				30,
				5,
				[
					2,
					3,
				],
				mediumRange,
			),
			roaches(
				13,
				8,
				[
					1,
					2,
				],
				mediumRange,
			),
		],
		// 8
		[
			baby(
				4,
				3,
				[
					3,
					3,
				],
				mediumRange,
			),
			archer(
				8,
				10,
				[
					1,
					2,
				],
				mediumRange,
			),
			aphid(
				4,
				2,
				[
					1,
					2,
				],
				mediumRange,
			),
		],
		// 9
		[
			warrior(
				10,
				3,
				[
					2,
					3,
				],
				longRange,
			),
		],
		// 10
		[
			baby(
				4,
				3,
				[
					8,
					9,
				],
				longRange,
			),
			hedgehog(
				12,
				10,
				[
					1,
					2,
				],
				mediumRange,
			),
		],
		// 11
		[
			baby(
				4,
				3,
				[
					3,
					4,
				],
				mediumRange,
			),
			aphid(
				25,
				3,
				[
					2,
					3,
				],
				mediumRange,
			),
			badgers(
				15,
				10,
				[
					1,
					2,
				],
				mediumRange,
			),
		],
		// 12
		[
			baby(
				4,
				3,
				[
					3,
					4,
				],
				longRange,
			),
		],
		// 13: tanky chasers with spitters, bruisers join late
		[
			badgers(
				1,
				4,
				[
					3,
					4,
				],
				mediumRange,
			),
			aphid(
				4,
				8,
				[
					2,
					3,
				],
				mediumRange,
			),
			baby(
				8,
				3,
				[
					4,
					5,
				],
				longRange,
			),
			warrior(
				30,
				4,
				[
					1,
					2,
				],
				longRange,
			),
		],
		// 14: fast fodder all wave, babies pour in from the middle
		[
			hedgehog(
				1,
				3,
				[
					2,
					3,
				],
				mediumRange,
			),
			baby(
				15,
				2,
				[
					3,
					4,
				],
				longRange,
			),
			warrior(
				20,
				8,
				[
					2,
					2,
				],
				longRange,
			),
			archer(
				22,
				6,
				[
					1,
					2,
				],
				mediumRange,
			),
		],
		// 15: babies and spitters, hedgehog rush in the second half
		[
			baby(
				1,
				3,
				[
					4,
					5,
				],
				mediumRange,
			),
			aphid(
				8,
				3,
				[
					1,
					2,
				],
				mediumRange,
			),
			hedgehog(
				20,
				2,
				[
					1,
					2,
				],
				mediumRange,
			),
			roaches(
				25,
				5,
				[
					1,
					1,
				],
				mediumRange,
			),
		],
		// 16: tanky chasers, then a burst of hedgehogs and bruisers
		[
			badgers(
				1,
				4,
				[
					4,
					5,
				],
				mediumRange,
			),
			baby(
				5,
				4,
				[
					3,
					4,
				],
				longRange,
			),
			hedgehog(
				28,
				1,
				[
					2,
					3,
				],
				mediumRange,
			),
			warrior(
				30,
				3,
				[
					1,
					1,
				],
				longRange,
			),
		],
		// 17: roaches hunt the whole wave
		[
			roaches(
				1,
				3,
				[
					2,
					3,
				],
				mediumRange,
			),
			archer(
				4,
				10,
				[
					1,
					2,
				],
				mediumRange,
			),
			baby(
				10,
				3,
				[
					3,
					4,
				],
				longRange,
			),
			hedgehog(
				30,
				1,
				[
					2,
					3,
				],
				mediumRange,
			),
		],
		// 18: charger stampede with spitter cover
		[
			boar(
				1,
				3,
				[
					3,
					4,
				],
				longRange,
			),
			badgers(
				10,
				5,
				[
					2,
					3,
				],
				mediumRange,
			),
			aphid(
				20,
				3,
				[
					1,
					2,
				],
				mediumRange,
			),
			colorado(
				30,
				2,
				[
					3,
					4,
				],
				shortRange,
			),
		],
		// 19: constant babies with every heavy enemy
		[
			baby(
				1,
				2,
				[
					3,
					4,
				],
				longRange,
			),
			archer(
				5,
				8,
				[
					1,
					2,
				],
				mediumRange,
			),
			warrior(
				15,
				4,
				[
					2,
					2,
				],
				longRange,
			),
			roaches(
				25,
				5,
				[
					1,
					1,
				],
				mediumRange,
			),
			boar(
				30,
				5,
				[
					2,
					3,
				],
				mediumRange,
			),
		],
		// 20: horde
		[
			baby(
				1,
				3,
				[
					4,
					5,
				],
				longRange,
			),
			colorado(
				1,
				3,
				[
					3,
					4,
				],
				shortRange,
			),
			badgers(
				5,
				6,
				[
					2,
					3,
				],
				mediumRange,
			),
			warrior(
				20,
				4,
				[
					2,
					2,
				],
				longRange,
			),
			aphid(
				30,
				4,
				[
					2,
					2,
				],
				mediumRange,
			),
		],
		// 21: chaser swarm
		[
			colorado(
				1,
				2,
				[
					3,
					4,
				],
				shortRange,
			),
			hedgehog(
				10,
				3,
				[
					2,
					3,
				],
				mediumRange,
			),
			roaches(
				20,
				6,
				[
					1,
					2,
				],
				mediumRange,
			),
		],
		// 22: ranged siege
		[
			aphid(
				1,
				4,
				[
					2,
					3,
				],
				mediumRange,
			),
			archer(
				1,
				5,
				[
					2,
					2,
				],
				mediumRange,
			),
			baby(
				10,
				3,
				[
					3,
					4,
				],
				longRange,
			),
			badgers(
				20,
				5,
				[
					2,
					2,
				],
				mediumRange,
			),
		],
		// 23: bruiser wall
		[
			warrior(
				1,
				4,
				[
					2,
					3,
				],
				longRange,
			),
			badgers(
				5,
				4,
				[
					2,
					3,
				],
				mediumRange,
			),
			baby(
				1,
				3,
				[
					4,
					5,
				],
				mediumRange,
			),
		],
		// 24: stampede
		[
			boar(
				1,
				2,
				[
					2,
					3,
				],
				longRange,
			),
			colorado(
				10,
				3,
				[
					3,
					4,
				],
				shortRange,
			),
			aphid(
				20,
				5,
				[
					1,
					2,
				],
				mediumRange,
			),
			warrior(
				30,
				6,
				[
					1,
					2,
				],
				longRange,
			),
		],
		// 25: horde
		[
			baby(
				1,
				3,
				[
					5,
					6,
				],
				longRange,
			),
			colorado(
				1,
				3,
				[
					3,
					4,
				],
				shortRange,
			),
			hedgehog(
				15,
				2,
				[
					2,
					3,
				],
				mediumRange,
			),
			warrior(
				20,
				4,
				[
					2,
					2,
				],
				longRange,
			),
			roaches(
				30,
				5,
				[
					1,
					2,
				],
				mediumRange,
			),
		],
		// 26: hunt
		[
			roaches(
				1,
				2,
				[
					2,
					2,
				],
				mediumRange,
			),
			badgers(
				1,
				4,
				[
					3,
					4,
				],
				mediumRange,
			),
			archer(
				10,
				6,
				[
					2,
					2,
				],
				mediumRange,
			),
			baby(
				20,
				3,
				[
					3,
					4,
				],
				longRange,
			),
		],
		// 27: mixed
		[
			hedgehog(
				1,
				2,
				[
					2,
					3,
				],
				mediumRange,
			),
			aphid(
				5,
				4,
				[
					2,
					3,
				],
				mediumRange,
			),
			boar(
				10,
				4,
				[
					2,
					3,
				],
				mediumRange,
			),
			warrior(
				25,
				5,
				[
					2,
					2,
				],
				longRange,
			),
			baby(
				30,
				2,
				[
					3,
					4,
				],
				longRange,
			),
		],
		// 28: siege and swarm
		[
			archer(
				1,
				4,
				[
					2,
					2,
				],
				mediumRange,
			),
			aphid(
				1,
				4,
				[
					2,
					3,
				],
				mediumRange,
			),
			colorado(
				10,
				2,
				[
					3,
					4,
				],
				shortRange,
			),
			badgers(
				20,
				5,
				[
					2,
					3,
				],
				mediumRange,
			),
		],
		// 29: everything
		[
			baby(
				1,
				2,
				[
					3,
					4,
				],
				longRange,
			),
			roaches(
				5,
				5,
				[
					2,
					2,
				],
				mediumRange,
			),
			warrior(
				10,
				4,
				[
					2,
					3,
				],
				longRange,
			),
			boar(
				20,
				4,
				[
					2,
					3,
				],
				mediumRange,
			),
			archer(
				30,
				5,
				[
					2,
					2,
				],
				mediumRange,
			),
		],
		// 30: final horde
		[
			baby(
				1,
				2,
				[
					3,
					4,
				],
				longRange,
			),
			colorado(
				1,
				3,
				[
					3,
					4,
				],
				shortRange,
			),
			badgers(
				5,
				5,
				[
					3,
					4,
				],
				mediumRange,
			),
			warrior(
				15,
				4,
				[
					2,
					3,
				],
				longRange,
			),
			roaches(
				20,
				5,
				[
					2,
					2,
				],
				mediumRange,
			),
			aphid(
				30,
				4,
				[
					2,
					2,
				],
				mediumRange,
			),
			boar(
				40,
				3,
				[
					2,
					3,
				],
				mediumRange,
			),
		],
	];

export const LAST_DESIGNED_WAVE =
	waves.length;

/** Waves after the last designed one repeat this many last designed waves */
export const ENDLESS_CYCLE_LENGTH = 10;

/** Extra enemies per cluster can't grow above this to keep the map playable */
export const ENDLESS_MAX_EXTRA_AMOUNT = 2;

/**
 * Extra enemies per cluster for a wave after the last designed one:
 * +1 on the first endless cycle, +1 more for every further cycle.
 */
export function endlessExtraAmount(
	wave: number,
): number {
	if (
		wave <=
		LAST_DESIGNED_WAVE
	) {
		return 0;
	}
	const cycle =
		Math.floor(
			(wave -
				LAST_DESIGNED_WAVE -
				1) /
				ENDLESS_CYCLE_LENGTH,
		);
	return Math.min(
		cycle +
			1,
		ENDLESS_MAX_EXTRA_AMOUNT,
	);
}

/**
 * Spawn groups of a wave. Waves after the last designed one cycle through
 * the last {@link ENDLESS_CYCLE_LENGTH} designed waves with more enemies
 * per cluster; their stats keep growing by the endless factor.
 */
export function getWaveDefinition(
	wave: number,
): WaveDefinition {
	if (
		wave <
		1
	) {
		return requireDefined(
			waves[0],
		);
	}
	if (
		wave <=
		LAST_DESIGNED_WAVE
	) {
		return requireDefined(
			waves[
				wave -
					1
			],
		);
	}
	const cycleStart =
		LAST_DESIGNED_WAVE -
		ENDLESS_CYCLE_LENGTH;
	const template =
		requireDefined(
			waves[
				cycleStart +
					((wave -
						LAST_DESIGNED_WAVE -
						1) %
						ENDLESS_CYCLE_LENGTH)
			],
		);
	const extra =
		endlessExtraAmount(
			wave,
		);
	return template.map(
		(
			group,
		) => ({
			...group,
			amount:
				[
					group
						.amount[0] +
						extra,
					group
						.amount[1] +
						extra,
				],
		}),
	);
}

/** Seconds of a wave when the group spawns */
export function isGroupSpawnSecond(
	group: SpawnGroup,
	second: number,
): boolean {
	if (
		second <
			group.firstSpawn ||
		second >
			(group.lastSpawn ??
				Infinity)
	) {
		return false;
	}
	return (
		(second -
			group.firstSpawn) %
			group.interval ===
		0
	);
}
