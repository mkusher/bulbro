import {
	describe,
	expect,
	it,
} from "bun:test";
import { BULBRO_BODY_SIZE } from "../../bulbro";
import { BulbroState } from "../../bulbro/BulbroState";
import { baseStats } from "../../characters-definitions/base";
import { babyEnemy } from "../../enemies-definitions/baby";
import { ChasingBehavior } from "../../enemy/ChasingBehavior";
import { enemyBodySize } from "../../enemy/EnemyBody";
import {
	EnemyState,
	spawnEnemy,
} from "../../enemy/EnemyState";
import {
	type GameEvent,
	type GameEventInternal,
	withEventMetaMultiple,
} from "../../game-events/GameEvents";
import {
	deltaTime as dt,
	type NowTime,
	nowTime,
} from "../../time";
import {
	updateState,
	type WaveState,
} from "../../waveState";
import {
	getWeaponByType,
	toWeaponState,
	type WeaponType,
} from "../../weapon";
import { TOUCH_MARGIN } from "../../weapon/Attack";
import type { MeleeStrike } from "../../weapon/MeleeStrike";
import type { WeaponState } from "../../weapon/WeaponState";
import { EnemyBehaviorEventGenerator } from "./EnemyBehaviorEventGenerator";
import { MeleeStrikeEventGenerator } from "./MeleeStrikeEventGenerator";
import { PlayerWeaponEventGenerator } from "./PlayerWeaponEventGenerator";

/** Crits are random: keep damage deterministic */
function withoutCrits(
	weapon: WeaponState,
): WeaponState {
	return {
		...weapon,
		statsBonus:
			{
				...weapon.statsBonus,
				critChance: 0,
			},
	};
}

function createBulbro(
	weapon: WeaponType = "sword",
	position = {
		x: 1000,
		y: 1000,
	},
): BulbroState {
	return new BulbroState(
		{
			statSources:
				[],
			id: "p1",
			type: "normal",
			characterId:
				"well-rounded",
			position,
			level: 1,
			totalExperience: 0,
			materialsAvailable: 0,
			healthPoints: 80,
			stats:
				{
					...baseStats,
					maxHp: 100,
					damage: 0,
					range: 0,
					attackSpeed: 0,
					knockback: 0,
				},
			weapons:
				[
					withoutCrits(
						toWeaponState(
							getWeaponByType(
								weapon,
							),
						),
					),
				],
			lastMovedAt: 0,
			lastHitAt: 0,
			healedByHpRegenerationAt: 0,
			rerollCount: 0,
			lastDirection:
				{
					x: 1,
					y: 0,
				},
			lastHorizontalDirection: 1,
		},
	);
}

function createEnemy(
	id: string,
	x: number,
	y: number,
	healthPoints = 100,
): EnemyState {
	return new EnemyState(
		{
			id,
			type: "potatoBeetleBaby",
			position:
				{
					x,
					y,
				},
			healthPoints,
			stats:
				{
					maxHp:
						healthPoints,
					hpRegeneration: 0,
					damage: 5,
					meleeDamage: 0,
					rangedDamage: 0,
					elementalDamage: 0,
					attackSpeed: 1,
					critChance: 0,
					range: 20,
					armor: 0,
					dodge: 0,
					speed: 50,
					materialsDropped: 1,
					knockback: 0,
				},
			weapons:
				[],
			lastMovedAt: 0,
			lastHitAt: 0,
			lastHorizontalDirection: 1,
		},
	);
}

function makeState(
	players: BulbroState[],
	enemies: EnemyState[],
): WaveState {
	return {
		mapSize:
			{
				width: 6000,
				height: 4500,
			},
		players,
		enemies,
		objects:
			[],
		shots:
			[],
		lastShotsAt:
			nowTime(
				0,
			),
		lastMovementsAt:
			nowTime(
				0,
			),
		round:
			{
				isRunning: true,
				duration: 60,
				wave: 1,
				difficulty: 0,
				startedAt:
					Date.now(),
			},
	} as WaveState;
}

function apply(
	state: WaveState,
	events: GameEventInternal[],
	now: NowTime,
	delta: number,
) {
	return withEventMetaMultiple(
		events,
		dt(
			delta,
		),
		now,
	).reduce(
		(
			s: WaveState,
			e: GameEvent,
		) =>
			updateState(
				s,
				e,
			),
		state,
	);
}

/** Runs attack + strike generators for `ticks` ticks, returning final state and all events. */
function simulate(
	initial: WaveState,
	start: number,
	ticks: number,
	delta = 16,
) {
	const weaponGenerator =
		new PlayerWeaponEventGenerator();
	const strikeGenerator =
		new MeleeStrikeEventGenerator();
	let state =
		initial;
	const all: GameEventInternal[] =
		[];
	for (
		let i = 0;
		i <
		ticks;
		i++
	) {
		const now =
			nowTime(
				start +
					i *
						delta,
			);
		const events =
			[
				...weaponGenerator.generate(
					state,
					dt(
						delta,
					),
					now,
				),
				...strikeGenerator.generate(
					state,
					dt(
						delta,
					),
					now,
				),
			];
		all.push(
			...events,
		);
		state =
			apply(
				state,
				events,
				now,
				delta,
			);
	}
	return {
		state,
		events:
			all,
	};
}

const hitEnemyIds =
	(
		events: GameEventInternal[],
	) =>
		events
			.flatMap(
				(
					e,
				) =>
					e.type ===
					"enemyReceivedHit"
						? [
								e.enemyId,
							]
						: [],
			)
			.sort();

const strikeOf =
	(
		events: GameEventInternal[],
	):
		| MeleeStrike
		| undefined =>
		events.flatMap(
			(
				e,
			) =>
				e.type ===
					"bulbroAttacked" &&
				e.strike
					? [
							e.strike,
						]
					: [],
		)[0];

describe("MeleeStrikeEventGenerator", () => {
	const sword =
		getWeaponByType(
			"sword",
		);
	const knife =
		getWeaponByType(
			"knife",
		);

	it("melee weapons strike instead of firing shots", () => {
		for (const [
			weapon,
			strikeType,
		] of [
			[
				"sword",
				"swing",
			],
			[
				"knife",
				"thrust",
			],
			[
				"fist",
				"thrust",
			],
			[
				"brick",
				"swing",
			],
		] as const) {
			const state =
				makeState(
					[
						createBulbro(
							weapon,
						),
					],
					[
						createEnemy(
							"e1",
							1060,
							1000,
						),
					],
				);
			const events =
				new PlayerWeaponEventGenerator().generate(
					state,
					dt(
						16,
					),
					nowTime(
						5000,
					),
				);
			expect(
				events.some(
					(
						e,
					) =>
						e.type ===
						"shot",
				),
			).toBe(
				false,
			);
			const strike =
				strikeOf(
					events,
				);
			expect(
				strike?.type,
			).toBe(
				strikeType,
			);
			expect(
				strike?.targetId,
			).toBe(
				"e1",
			);
			const def =
				getWeaponByType(
					weapon,
				);
			expect(
				strike?.reach,
			).toBe(
				def
					.statsBonus
					.range ??
					0,
			);
			expect(
				strike?.damage,
			).toBe(
				def
					.statsBonus
					.damage ??
					0,
			);
		}
	});

	it("guns still fire shots", () => {
		const state =
			makeState(
				[
					createBulbro(
						"pistol",
					),
				],
				[
					createEnemy(
						"e1",
						1100,
						1000,
					),
				],
			);
		const events =
			new PlayerWeaponEventGenerator().generate(
				state,
				dt(
					16,
				),
				nowTime(
					5000,
				),
			);
		expect(
			events.some(
				(
					e,
				) =>
					e.type ===
					"shot",
			),
		).toBe(
			true,
		);
		expect(
			strikeOf(
				events,
			),
		).toBeUndefined();
	});

	it("swing hits the target once and knocks it back", () => {
		const {
			state,
			events,
		} =
			simulate(
				makeState(
					[
						createBulbro(),
					],
					[
						createEnemy(
							"e1",
							1060,
							1000,
						),
					],
				),
				5000,
				30,
			);
		expect(
			hitEnemyIds(
				events,
			),
		).toEqual(
			[
				"e1",
			],
		);
		const enemy =
			state
				.enemies[0];
		expect(
			enemy?.healthPoints,
		).toBe(
			100 -
				(sword
					.statsBonus
					.damage ??
					0),
		);
		expect(
			enemy
				?.knockback
				?.strength,
		).toBe(
			sword
				.statsBonus
				.knockback ??
				0,
		);
		// Pushed away from the player
		expect(
			enemy
				?.knockback
				?.direction
				.x,
		).toBeGreaterThan(
			0,
		);
		expect(
			state
				.players[0]
				?.weapons[0]
				?.strike
				?.hitTargetIds,
		).toEqual(
			[
				"e1",
			],
		);
	});

	it("swing hits every enemy inside the swept arc, but not ones behind or out of reach", () => {
		const {
			events,
		} =
			simulate(
				makeState(
					[
						createBulbro(),
					],
					[
						createEnemy(
							"target",
							1060,
							1000,
						),
						createEnemy(
							"side",
							1040,
							1050,
						),
						createEnemy(
							"behind",
							880,
							1000,
						),
						createEnemy(
							"far",
							1300,
							1000,
						),
					],
				),
				5000,
				30,
			);
		expect(
			hitEnemyIds(
				events,
			),
		).toEqual(
			[
				"side",
				"target",
			],
		);
	});

	it("thrust hits enemies on the line to the target and pushes them along it", () => {
		const {
			state,
			events,
		} =
			simulate(
				makeState(
					[
						createBulbro(
							"knife",
						),
					],
					[
						createEnemy(
							"target",
							1100,
							1000,
						),
						createEnemy(
							"side",
							1050,
							1110,
						),
						createEnemy(
							"behind",
							880,
							1000,
						),
					],
				),
				5000,
				30,
			);
		expect(
			hitEnemyIds(
				events,
			),
		).toEqual(
			[
				"target",
			],
		);
		const target =
			state.enemies.find(
				(
					e,
				) =>
					e.id ===
					"target",
			);
		expect(
			target?.healthPoints,
		).toBe(
			100 -
				(knife
					.statsBonus
					.damage ??
					0),
		);
		expect(
			target
				?.knockback
				?.strength,
		).toBe(
			knife
				.statsBonus
				.knockback ??
				0,
		);
		expect(
			target
				?.knockback
				?.direction
				.x,
		).toBeCloseTo(
			1,
		);
	});

	it("enemy melee strikes hit players", () => {
		const player =
			createBulbro(
				"pistol",
			);
		const enemy =
			spawnEnemy(
				"baby",
				{
					x: 1100,
					y: 1000,
				},
				babyEnemy,
			);
		let state =
			makeState(
				[
					player,
				],
				[
					enemy,
				],
			);
		const behavior =
			new EnemyBehaviorEventGenerator();
		const strikes =
			new MeleeStrikeEventGenerator();
		const all: GameEventInternal[] =
			[];
		for (
			let i = 0;
			i <
			40;
			i++
		) {
			const now =
				nowTime(
					5000 +
						i *
							16,
				);
			const events =
				[
					...behavior.generate(
						state,
						dt(
							16,
						),
						now,
					),
					...strikes.generate(
						state,
						dt(
							16,
						),
						now,
					),
				];
			all.push(
				...events,
			);
			state =
				apply(
					state,
					events,
					now,
					16,
				);
		}
		expect(
			all.some(
				(
					e,
				) =>
					e.type ===
					"shot",
			),
		).toBe(
			false,
		);
		const attack =
			all.find(
				(
					e,
				) =>
					e.type ===
					"enemyAttacked",
			);
		expect(
			attack?.type ===
				"enemyAttacked" &&
				attack
					.strike
					?.type,
		).toBe(
			"thrust",
		);
		const hits =
			all.filter(
				(
					e,
				) =>
					e.type ===
					"bulbroReceivedHit",
			);
		expect(
			hits,
		).toHaveLength(
			1,
		);
		expect(
			state
				.players[0]
				?.healthPoints,
		).toBeLessThan(
			player.healthPoints,
		);
		expect(
			state
				.enemies[0]
				?.weapons[0]
				?.strike
				?.hitTargetIds,
		).toEqual(
			[
				"p1",
			],
		);
	});

	it("does not hit anything when the striker is dead", () => {
		const player =
			createBulbro();
		const strike: MeleeStrike =
			{
				type: "swing",
				startedAt: 5000,
				duration: 200,
				centerAngle: 0,
				arc: Math.PI,
				sweep: 1,
				reach: 100,
				innerRadius: 10,
				damage: 10,
				knockback: 0,
				targetId:
					"e1",
				hitTargetIds:
					[],
				sweptUntil: 5000,
			};
		const dead =
			new BulbroState(
				{
					...player.toJSON(),
					healthPoints: 0,
					killedAt: 1,
					weapons:
						[
							{
								...player
									.weapons[0]!,
								strike,
							},
						],
				},
			);
		const events =
			new MeleeStrikeEventGenerator().generate(
				makeState(
					[
						dead,
					],
					[
						createEnemy(
							"e1",
							1060,
							1000,
						),
					],
				),
				dt(
					16,
				),
				nowTime(
					5100,
				),
			);
		expect(
			events,
		).toHaveLength(
			0,
		);
	});

	it("sweeps the whole strike even when a single tick spans it with a capped delta", () => {
		const initial =
			makeState(
				[
					createBulbro(),
				],
				[
					createEnemy(
						"target",
						1060,
						1000,
					),
					createEnemy(
						"side",
						1040,
						1050,
					),
				],
			);
		const swinging =
			apply(
				initial,
				new PlayerWeaponEventGenerator().generate(
					initial,
					dt(
						16,
					),
					nowTime(
						5000,
					),
				),
				nowTime(
					5000,
				),
				16,
			);
		// One late frame, 1s after the attack, with delta capped at 100ms
		const events =
			new MeleeStrikeEventGenerator().generate(
				swinging,
				dt(
					100,
				),
				nowTime(
					6000,
				),
			);
		expect(
			hitEnemyIds(
				events,
			),
		).toEqual(
			[
				"side",
				"target",
			],
		);
		const after =
			apply(
				swinging,
				events,
				nowTime(
					6000,
				),
				100,
			);
		expect(
			new MeleeStrikeEventGenerator().generate(
				after,
				dt(
					16,
				),
				nowTime(
					6016,
				),
			),
		).toHaveLength(
			0,
		);
	});
});

describe("enemy touch attacks", () => {
	const attackFrom =
		(
			x: number,
			y: number,
		) => {
			const player =
				createBulbro(
					"pistol",
				);
			const enemy =
				spawnEnemy(
					"baby",
					{
						x,
						y,
					},
					babyEnemy,
				);
			return new ChasingBehavior().attack(
				enemy,
				makeState(
					[
						player,
					],
					[
						enemy,
					],
				),
				nowTime(
					5000,
				),
				dt(
					16,
				),
			);
		};
	const strikeFrom =
		(
			x: number,
			y: number,
		) => {
			const attack =
				attackFrom(
					x,
					y,
				).find(
					(
						e,
					) =>
						e.type ===
						"enemyAttacked",
				);
			return attack?.type ===
				"enemyAttacked"
				? attack.strike
				: undefined;
		};
	const baby =
		enemyBodySize(
			"potatoBeetleBaby",
		);
	// Drawn bodies touch when centers are the sum of their half-sizes apart
	const touchX =
		baby.width /
			2 +
		BULBRO_BODY_SIZE.width /
			2;
	const touchY =
		baby.height /
			2 +
		BULBRO_BODY_SIZE.height /
			2;

	it("does not attack a player it is not visibly touching, whatever its range stat", () => {
		expect(
			babyEnemy
				.stats
				.range,
		).toBeGreaterThan(
			100,
		);
		expect(
			attackFrom(
				1000 +
					touchX +
					TOUCH_MARGIN +
					2,
				1000,
			),
		).toHaveLength(
			0,
		);
		expect(
			attackFrom(
				1000,
				1000 +
					touchY +
					TOUCH_MARGIN +
					2,
			),
		).toHaveLength(
			0,
		);
		// Old hitbox-based touch distance
		expect(
			attackFrom(
				1100,
				1000,
			),
		).toHaveLength(
			0,
		);
	});

	it("attacks a touching player with a strike reaching just past its body", () => {
		const strike =
			strikeFrom(
				1000 +
					touchX,
				1000,
			);
		expect(
			strike?.type,
		).toBe(
			"thrust",
		);
		expect(
			strike?.reach,
		).toBeCloseTo(
			baby.width /
				2 +
				TOUCH_MARGIN,
		);
		expect(
			strikeFrom(
				1000,
				1000 +
					touchY,
			),
		).toBeDefined();
	});
});

describe("sword", () => {
	it("alternates swing and thrust attacks", () => {
		// Sword cooldown is 0.9s; simulate ~3 attacks against a sturdy enemy
		const {
			events,
		} =
			simulate(
				makeState(
					[
						createBulbro(
							"sword",
						),
					],
					[
						createEnemy(
							"e1",
							1060,
							1000,
							10000,
						),
					],
				),
				5000,
				180,
			);
		const strikes =
			events.flatMap(
				(
					e,
				) =>
					e.type ===
						"bulbroAttacked" &&
					e.strike
						? [
								e
									.strike
									.type,
							]
						: [],
			);
		expect(
			strikes as string[],
		).toEqual(
			[
				"swing",
				"thrust",
				"swing",
				"thrust",
			].slice(
				0,
				strikes.length,
			),
		);
		expect(
			strikes.length,
		).toBeGreaterThanOrEqual(
			3,
		);
		// Every strike connected
		expect(
			hitEnemyIds(
				events,
			),
		).toHaveLength(
			strikes.length,
		);
	});
});

describe("life steal", () => {
	it("heals the striking player once per tick when it steals life", () => {
		const vampire =
			createBulbro();
		const player =
			new BulbroState(
				{
					...vampire.toJSON(),
					stats:
						{
							...vampire.stats,
							lifeSteal: 100,
						},
				},
			);
		const {
			state,
			events,
		} =
			simulate(
				makeState(
					[
						player,
					],
					[
						createEnemy(
							"e1",
							1060,
							1000,
						),
						createEnemy(
							"e2",
							1060,
							1010,
						),
					],
				),
				5000,
				30,
			);
		expect(
			hitEnemyIds(
				events,
			),
		).toEqual(
			[
				"e1",
				"e2",
			],
		);
		const heals =
			events.filter(
				(
					e,
				) =>
					e.type ===
						"bulbroHealed" &&
					e.source ===
						"lifeSteal",
			);
		expect(
			heals,
		).toHaveLength(
			1,
		);
		expect(
			state
				.players[0]
				?.healthPoints,
		).toBe(
			player.healthPoints +
				1,
		);
	});

	it("does not heal without life steal", () => {
		const {
			events,
		} =
			simulate(
				makeState(
					[
						createBulbro(),
					],
					[
						createEnemy(
							"e1",
							1060,
							1000,
						),
					],
				),
				5000,
				30,
			);
		expect(
			events.some(
				(
					e,
				) =>
					e.type ===
					"bulbroHealed",
			),
		).toBe(
			false,
		);
	});
});
